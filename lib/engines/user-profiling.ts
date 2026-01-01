/**
 * User Profiling Engine
 * 
 * Maintains dynamic student model with concept-wise mastery, learning patterns,
 * and mistake tracking. Updates after every interaction.
 */

import { PrismaClient, UserProfile } from '@prisma/client';

export interface MistakePattern {
  errorType: string;
  count: number;
  lastOccurred: Date;
}

export interface LearningMetrics {
  masteryScore: number;
  confidence: number;
  attempts: number;
  correctCount: number;
  timeSpent: number;
  mistakePatterns: MistakePattern[];
  confusionCount: number;
  hesitationCount: number;
}

export class UserProfilingEngine {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get or create user profile for a concept
   */
  async getProfile(
    userId: string,
    conceptId: string
  ): Promise<UserProfile> {
    let profile = await this.prisma.userProfile.findUnique({
      where: {
        userId_conceptId: {
          userId,
          conceptId,
        },
      },
    });

    if (!profile) {
      profile = await this.prisma.userProfile.create({
        data: {
          userId,
          conceptId,
          masteryScore: 0,
          confidence: 0,
          attempts: 0,
          correctCount: 0,
          timeSpent: 0,
          mistakePatterns: {},
          confusionCount: 0,
          hesitationCount: 0,
        },
      });
    }

    return profile;
  }

  /**
   * Update mastery score based on assessment results
   */
  async updateMastery(
    userId: string,
    conceptId: string,
    score: number, // 0-1
    timeSpent: number = 0 // minutes
  ): Promise<UserProfile> {
    const profile = await this.getProfile(userId, conceptId);

    // Exponential moving average for mastery
    const alpha = 0.3; // Learning rate
    const newMastery = alpha * score + (1 - alpha) * profile.masteryScore;

    // Update confidence based on consistency
    const attempts = profile.attempts + 1;
    const correctCount = profile.correctCount + (score > 0.7 ? 1 : 0);
    const confidence = correctCount / attempts;

    return this.prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        masteryScore: Math.min(1.0, Math.max(0.0, newMastery)),
        confidence: Math.min(1.0, Math.max(0.0, confidence)),
        attempts,
        correctCount,
        timeSpent: profile.timeSpent + timeSpent,
        lastStudied: new Date(),
      },
    });
  }

  /**
   * Record a mistake pattern
   */
  async recordMistake(
    userId: string,
    conceptId: string,
    errorType: string
  ): Promise<void> {
    const profile = await this.getProfile(userId, conceptId);
    const patterns = (profile.mistakePatterns as Record<string, any>) ?? {};

    if (!patterns[errorType]) {
      patterns[errorType] = {
        count: 0,
        lastOccurred: new Date().toISOString(),
      };
    }

    patterns[errorType].count += 1;
    patterns[errorType].lastOccurred = new Date().toISOString();

    await this.prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        mistakePatterns: patterns,
      },
    });
  }

  /**
   * Record confusion signal (hesitation, repeated questions)
   */
  async recordConfusion(
    userId: string,
    conceptId: string,
    type: 'hesitation' | 'repeated_question' | 'wrong_reasoning'
  ): Promise<void> {
    const profile = await this.getProfile(userId, conceptId);

    await this.prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        confusionCount: profile.confusionCount + 1,
        hesitationCount: type === 'hesitation' 
          ? profile.hesitationCount + 1 
          : profile.hesitationCount,
      },
    });
  }

  /**
   * Get learning metrics for a concept
   */
  async getMetrics(
    userId: string,
    conceptId: string
  ): Promise<LearningMetrics> {
    const profile = await this.getProfile(userId, conceptId);
    const patterns = (profile.mistakePatterns as Record<string, any>) ?? {};

    const mistakePatterns: MistakePattern[] = Object.entries(patterns).map(
      ([errorType, data]: [string, any]) => ({
        errorType,
        count: data.count ?? 0,
        lastOccurred: new Date(data.lastOccurred ?? Date.now()),
      })
    );

    return {
      masteryScore: profile.masteryScore,
      confidence: profile.confidence,
      attempts: profile.attempts,
      correctCount: profile.correctCount,
      timeSpent: profile.timeSpent,
      mistakePatterns,
      confusionCount: profile.confusionCount,
      hesitationCount: profile.hesitationCount,
    };
  }

  /**
   * Get all user profiles for a subject
   */
  async getSubjectProfiles(
    userId: string,
    subjectId: string
  ): Promise<UserProfile[]> {
    return this.prisma.userProfile.findMany({
      where: {
        userId,
        concept: {
          subjectId,
        },
      },
      include: {
        concept: true,
      },
    });
  }

  /**
   * Calculate learning velocity (concepts per hour)
   */
  async getLearningVelocity(userId: string): Promise<number> {
    const profiles = await this.prisma.userProfile.findMany({
      where: {
        userId,
        lastStudied: { not: null },
      },
    });

    if (profiles.length === 0) return 0;

    const totalTime = profiles.reduce((sum, p) => sum + p.timeSpent, 0);
    const masteredConcepts = profiles.filter(p => p.masteryScore >= 0.7).length;

    // Return concepts per hour
    return totalTime > 0 ? (masteredConcepts / totalTime) * 60 : 0;
  }

  /**
   * Get concepts with low mastery (need review)
   */
  async getWeakConcepts(
    userId: string,
    subjectId: string,
    threshold: number = 0.6
  ): Promise<UserProfile[]> {
    return this.prisma.userProfile.findMany({
      where: {
        userId,
        masteryScore: { lt: threshold },
        concept: {
          subjectId,
        },
      },
      include: {
        concept: true,
      },
      orderBy: {
        masteryScore: 'asc',
      },
    });
  }
}

