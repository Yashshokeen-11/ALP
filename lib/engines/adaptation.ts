/**
 * Adaptation Loop
 * 
 * Real-time personalization engine that:
 * - Updates student model after interactions
 * - Reorders curriculum dynamically
 * - Adjusts explanation depth and pace
 * - Triggers remediation for weak concepts
 */

import { PrismaClient } from '@prisma/client';
import { KnowledgeGraphEngine, LearningPath, ConceptNode } from './knowledge-graph';
import { UserProfilingEngine } from './user-profiling';

export interface AdaptationConfig {
  masteryThreshold: number; // 0-1, default 0.7
  reviewThreshold: number; // 0-1, concepts below this need review
  paceAdjustmentFactor: number; // 0.5-2.0, multiplier for learning speed
  depthAdjustment: 'surface' | 'balanced' | 'deep';
}

export interface AdaptationResult {
  updatedPath: LearningPath;
  recommendedActions: string[];
  paceAdjustment: number;
  depthAdjustment: 'surface' | 'balanced' | 'deep';
  remediationNeeded: string[]; // Concept IDs
}

export class AdaptationLoop {
  private knowledgeGraph: KnowledgeGraphEngine;
  private profilingEngine: UserProfilingEngine;

  constructor(private prisma: PrismaClient) {
    this.knowledgeGraph = new KnowledgeGraphEngine(prisma);
    this.profilingEngine = new UserProfilingEngine(prisma);
  }

  /**
   * Main adaptation function - called after each interaction
   */
  async adapt(
    userId: string,
    subjectId: string,
    config: Partial<AdaptationConfig> = {}
  ): Promise<AdaptationResult> {
    const fullConfig: AdaptationConfig = {
      masteryThreshold: config.masteryThreshold ?? 0.7,
      reviewThreshold: config.reviewThreshold ?? 0.6,
      paceAdjustmentFactor: config.paceAdjustmentFactor ?? 1.0,
      depthAdjustment: config.depthAdjustment ?? 'balanced',
    };

    // Get current learning path
    const currentPath = await this.knowledgeGraph.generateLearningPath(
      subjectId,
      userId,
      fullConfig.masteryThreshold
    );

    // Analyze learning patterns
    const learningVelocity = await this.profilingEngine.getLearningVelocity(userId);
    const weakConcepts = await this.profilingEngine.getWeakConcepts(
      userId,
      subjectId,
      fullConfig.reviewThreshold
    );

    // Adjust pace based on velocity
    const paceAdjustment = this.calculatePaceAdjustment(
      learningVelocity,
      fullConfig.paceAdjustmentFactor
    );

    // Determine depth adjustment
    const depthAdjustment = await this.determineDepthAdjustment(
      userId,
      subjectId,
      fullConfig
    );

    // Identify remediation needs
    const remediationNeeded = weakConcepts
      .filter(c => c.masteryScore < fullConfig.reviewThreshold)
      .map(c => c.conceptId);

    // Generate recommendations
    const recommendedActions = this.generateRecommendations(
      currentPath,
      weakConcepts,
      learningVelocity,
      remediationNeeded
    );

    // Reorder path if needed (prioritize gaps and weak concepts)
    const updatedPath = await this.reorderPath(
      currentPath,
      remediationNeeded,
      userId,
      subjectId
    );

    return {
      updatedPath,
      recommendedActions,
      paceAdjustment,
      depthAdjustment,
      remediationNeeded,
    };
  }

  /**
   * Calculate pace adjustment based on learning velocity
   */
  private calculatePaceAdjustment(
    velocity: number,
    baseFactor: number
  ): number {
    // Normalize velocity (assume 0.5 concepts/hour is average)
    const normalizedVelocity = velocity / 0.5;

    // Adjust pace: if learning fast, can go faster; if slow, slow down
    const adjustment = Math.min(2.0, Math.max(0.5, normalizedVelocity * baseFactor));

    return adjustment;
  }

  /**
   * Determine explanation depth adjustment
   */
  private async determineDepthAdjustment(
    userId: string,
    subjectId: string,
    config: AdaptationConfig
  ): Promise<'surface' | 'balanced' | 'deep'> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.depthPreference) {
      return user.depthPreference as 'surface' | 'balanced' | 'deep';
    }

    // Analyze mastery distribution
    const profiles = await this.profilingEngine.getSubjectProfiles(userId, subjectId);
    
    if (profiles.length === 0) {
      return 'surface'; // Start with surface
    }

    const avgMastery = profiles.reduce((sum, p) => sum + p.masteryScore, 0) / profiles.length;

    if (avgMastery < 0.4) {
      return 'surface';
    } else if (avgMastery > 0.7) {
      return 'deep';
    } else {
      return 'balanced';
    }
  }

  /**
   * Reorder learning path to prioritize gaps and weak concepts
   */
  private async reorderPath(
    currentPath: LearningPath,
    remediationNeeded: string[],
    userId: string,
    subjectId: string
  ): Promise<LearningPath> {
    if (remediationNeeded.length === 0) {
      return currentPath; // No reordering needed
    }

    // Get concepts that need remediation
    const remediationConcepts = currentPath.concepts.filter(c =>
      remediationNeeded.includes(c.id)
    );

    // Get remaining concepts
    const otherConcepts = currentPath.concepts.filter(
      c => !remediationNeeded.includes(c.id)
    );

    // Prioritize remediation concepts first (but respect prerequisites)
    const reordered: ConceptNode[] = [];
    const added = new Set<string>();

    // Add remediation concepts first (if prerequisites are met)
    for (const concept of remediationConcepts) {
      const canAdd = concept.prerequisites.every(prereqId => added.has(prereqId));
      if (canAdd) {
        reordered.push(concept);
        added.add(concept.id);
      }
    }

    // Add remaining concepts
    for (const concept of otherConcepts) {
      if (!added.has(concept.id)) {
        const canAdd = concept.prerequisites.every(prereqId => added.has(prereqId));
        if (canAdd) {
          reordered.push(concept);
          added.add(concept.id);
        }
      }
    }

    return {
      ...currentPath,
      concepts: reordered,
    };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    path: LearningPath,
    weakConcepts: any[],
    velocity: number,
    remediationNeeded: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (remediationNeeded.length > 0) {
      recommendations.push(
        `Review ${remediationNeeded.length} concept(s) before proceeding`
      );
    }

    if (path.gaps.length > 0) {
      recommendations.push(
        `Fill ${path.gaps.length} prerequisite gap(s) to unlock new concepts`
      );
    }

    if (velocity < 0.3) {
      recommendations.push('Consider slowing down and focusing on deep understanding');
    } else if (velocity > 1.0) {
      recommendations.push('You\'re learning quickly! Consider exploring advanced applications');
    }

    if (weakConcepts.length > 3) {
      recommendations.push('Multiple concepts need review - consider a focused review session');
    }

    return recommendations;
  }

  /**
   * Trigger spaced repetition review
   */
  async scheduleReview(
    userId: string,
    conceptId: string,
    daysUntilReview: number = 1
  ): Promise<void> {
    // In a full implementation, this would integrate with a spaced repetition system
    // For now, we'll mark concepts for review in the user profile
    const profile = await this.profilingEngine.getProfile(userId, conceptId);
    
    // Update last studied to trigger review logic
    await this.prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        lastStudied: new Date(),
      },
    });
  }

  /**
   * Get concepts due for review (spaced repetition)
   */
  async getConceptsDueForReview(
    userId: string,
    subjectId: string
  ): Promise<string[]> {
    const profiles = await this.profilingEngine.getSubjectProfiles(userId, subjectId);

    const now = new Date();
    const reviewThreshold = 7; // days

    return profiles
      .filter(profile => {
        if (!profile.lastStudied) return false;
        
        const daysSinceStudy = Math.floor(
          (now.getTime() - profile.lastStudied.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Review if:
        // 1. Mastery is below threshold, OR
        // 2. It's been more than reviewThreshold days
        return profile.masteryScore < 0.8 || daysSinceStudy > reviewThreshold;
      })
      .map(profile => profile.conceptId);
  }
}

