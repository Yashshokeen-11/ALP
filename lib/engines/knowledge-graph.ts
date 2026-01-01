/**
 * Knowledge Graph Engine
 * 
 * Manages concept graphs, prerequisite relationships, and learning path generation.
 * Uses graph algorithms to determine optimal learning sequences based on mastery.
 */

import { PrismaClient, Concept, UserProfile } from '@prisma/client';

export interface ConceptNode {
  id: string;
  title: string;
  slug: string;
  subjectId: string;
  prerequisites: string[]; // Concept IDs
  difficulty: number;
  masteryScore?: number; // User's mastery (0-1)
}

export interface LearningPath {
  concepts: ConceptNode[];
  totalEstimatedTime: number;
  gaps: string[]; // Missing prerequisite concept IDs
}

export class KnowledgeGraphEngine {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get all prerequisites for a concept (transitive closure)
   */
  async getPrerequisites(conceptId: string): Promise<string[]> {
    const visited = new Set<string>();
    const prerequisites: string[] = [];

    const traverse = async (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const concept = await this.prisma.concept.findUnique({
        where: { id },
        include: {
          prerequisites: {
            include: {
              prerequisite: true,
            },
          },
        },
      });

      if (!concept) return;

      for (const prereqRel of concept.prerequisites) {
        prerequisites.push(prereqRel.prerequisiteId);
        await traverse(prereqRel.prerequisiteId);
      }
    };

    await traverse(conceptId);
    return prerequisites;
  }

  /**
   * Check if user has mastered all prerequisites for a concept
   */
  async canAccessConcept(
    conceptId: string,
    userId: string,
    masteryThreshold: number = 0.7
  ): Promise<{ canAccess: boolean; missingPrereqs: string[] }> {
    const prerequisites = await this.getPrerequisites(conceptId);
    
    if (prerequisites.length === 0) {
      return { canAccess: true, missingPrereqs: [] };
    }

    const userProfiles = await this.prisma.userProfile.findMany({
      where: {
        userId,
        conceptId: { in: prerequisites },
      },
    });

    const masteryMap = new Map(
      userProfiles.map(p => [p.conceptId, p.masteryScore])
    );

    const missingPrereqs: string[] = [];
    for (const prereqId of prerequisites) {
      const mastery = masteryMap.get(prereqId) ?? 0;
      if (mastery < masteryThreshold) {
        missingPrereqs.push(prereqId);
      }
    }

    return {
      canAccess: missingPrereqs.length === 0,
      missingPrereqs,
    };
  }

  /**
   * Generate personalized learning path for a subject
   * Uses topological sort with mastery-based prioritization
   */
  async generateLearningPath(
    subjectId: string,
    userId: string,
    masteryThreshold: number = 0.7
  ): Promise<LearningPath> {
    // Get all concepts in subject
    const concepts = await this.prisma.concept.findMany({
      where: { subjectId },
      include: {
        prerequisites: {
          include: {
            prerequisite: true,
          },
        },
        profiles: {
          where: { userId },
        },
      },
    });

    // Build graph
    const conceptMap = new Map<string, ConceptNode>();
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    for (const concept of concepts) {
      const mastery = concept.profiles[0]?.masteryScore ?? 0;
      
      conceptMap.set(concept.id, {
        id: concept.id,
        title: concept.title,
        slug: concept.slug,
        subjectId: concept.subjectId,
        prerequisites: concept.prerequisites.map(p => p.prerequisiteId),
        difficulty: concept.difficulty,
        masteryScore: mastery,
      });

      inDegree.set(concept.id, concept.prerequisites.length);
      adjList.set(concept.id, []);
    }

    // Build reverse edges for topological sort
    for (const concept of concepts) {
      for (const prereqRel of concept.prerequisites) {
        const neighbors = adjList.get(prereqRel.prerequisiteId) ?? [];
        neighbors.push(concept.id);
        adjList.set(prereqRel.prerequisiteId, neighbors);
      }
    }

    // Topological sort with priority queue (by gap size and difficulty)
    const queue: Array<{ id: string; priority: number }> = [];
    const path: ConceptNode[] = [];
    const gaps: string[] = [];

    // Initialize queue with concepts that have no prerequisites or mastered prerequisites
    for (const [id, degree] of inDegree.entries()) {
      const node = conceptMap.get(id)!;
      if (degree === 0 || (node.masteryScore !== undefined && node.masteryScore >= masteryThreshold)) {
        const missingPrereqs = node.prerequisites.filter(
          prereqId => {
            const prereqNode = conceptMap.get(prereqId);
            return !prereqNode || (prereqNode.masteryScore ?? 0) < masteryThreshold;
          }
        );
        
        if (missingPrereqs.length === 0) {
          queue.push({
            id,
            priority: this.calculatePriority(node, missingPrereqs.length),
          });
        } else {
          gaps.push(...missingPrereqs);
        }
      }
    }

    // Process queue
    const processed = new Set<string>();
    while (queue.length > 0) {
      queue.sort((a, b) => b.priority - a.priority); // Max priority first
      const { id } = queue.shift()!;

      if (processed.has(id)) continue;
      processed.add(id);

      const node = conceptMap.get(id)!;
      path.push(node);

      // Update in-degrees and add ready concepts
      const neighbors = adjList.get(id) ?? [];
      for (const neighborId of neighbors) {
        const currentDegree = inDegree.get(neighborId) ?? 0;
        inDegree.set(neighborId, currentDegree - 1);

        if (currentDegree === 1) {
          const neighborNode = conceptMap.get(neighborId)!;
          const missingPrereqs = neighborNode.prerequisites.filter(
            prereqId => {
              const prereqNode = conceptMap.get(prereqId);
              return !prereqNode || (prereqNode.masteryScore ?? 0) < masteryThreshold;
            }
          );

          if (missingPrereqs.length === 0) {
            queue.push({
              id: neighborId,
              priority: this.calculatePriority(neighborNode, 0),
            });
          }
        }
      }
    }

    // Calculate total estimated time
    const totalEstimatedTime = path.reduce((sum, node) => {
      const concept = concepts.find(c => c.id === node.id);
      return sum + (concept?.estimatedTime ?? 30);
    }, 0);

    return {
      concepts: path,
      totalEstimatedTime,
      gaps: [...new Set(gaps)],
    };
  }

  /**
   * Calculate priority for concept ordering
   * Higher priority = should be learned sooner
   */
  private calculatePriority(node: ConceptNode, gapCount: number): number {
    // Prioritize concepts with:
    // - Fewer gaps (negative weight)
    // - Lower mastery (if partially learned)
    // - Lower difficulty
    const masteryBonus = node.masteryScore !== undefined 
      ? (1 - node.masteryScore) * 0.3 
      : 0.5;
    
    const difficultyPenalty = node.difficulty * 0.2;
    const gapPenalty = gapCount * 0.5;

    return masteryBonus - difficultyPenalty - gapPenalty;
  }

  /**
   * Find concepts similar to a given concept (for gap filling)
   */
  async findSimilarConcepts(
    conceptId: string,
    limit: number = 5
  ): Promise<Concept[]> {
    // TODO: Use vector embeddings for similarity search
    // For now, return concepts in same subject with similar difficulty
    const concept = await this.prisma.concept.findUnique({
      where: { id: conceptId },
    });

    if (!concept) return [];

    return this.prisma.concept.findMany({
      where: {
        subjectId: concept.subjectId,
        id: { not: conceptId },
        difficulty: {
          gte: concept.difficulty - 1,
          lte: concept.difficulty + 1,
        },
      },
      take: limit,
    });
  }

  /**
   * Get concept with full metadata
   */
  async getConcept(conceptId: string): Promise<Concept | null> {
    return this.prisma.concept.findUnique({
      where: { id: conceptId },
      include: {
        prerequisites: {
          include: {
            prerequisite: true,
          },
        },
        dependents: {
          include: {
            dependent: true,
          },
        },
      },
    });
  }
}

