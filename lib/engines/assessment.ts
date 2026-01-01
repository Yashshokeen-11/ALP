/**
 * Assessment & Feedback Engine
 * 
 * Generates conceptual questions, evaluates open-ended responses,
 * detects misconceptions, and provides adaptive feedback.
 */

import { PrismaClient, Question, Assessment, AssessmentResponse } from '@prisma/client';
import { UserProfilingEngine } from './user-profiling';
import OpenAI from 'openai';

export interface QuestionGenerationOptions {
  type: 'conceptual' | 'application' | 'reasoning';
  difficulty: number; // 0-5
  requireReasoning: boolean;
}

export interface AssessmentResult {
  score: number;
  maxScore: number;
  percentage: number;
  misconceptions: string[];
  feedback: string;
  recommendations: string[];
}

export class AssessmentEngine {
  private openai: OpenAI;
  private profilingEngine: UserProfilingEngine;

  constructor(
    private prisma: PrismaClient,
    apiKey?: string
  ) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY || '',
    });
    this.profilingEngine = new UserProfilingEngine(prisma);
  }

  /**
   * Generate conceptual question for a concept
   */
  async generateQuestion(
    conceptId: string,
    options: QuestionGenerationOptions
  ): Promise<Question> {
    const concept = await this.prisma.concept.findUnique({
      where: { id: conceptId },
    });

    if (!concept) {
      throw new Error(`Concept ${conceptId} not found`);
    }

    // Use LLM to generate question
    const prompt = this.buildQuestionGenerationPrompt(concept, options);

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educator who creates conceptual questions that test deep understanding, not memorization.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const generatedContent = completion.choices[0]?.message?.content ?? '';
    
    // Parse generated question (simplified - in production, use structured output)
    const question = this.parseGeneratedQuestion(generatedContent, concept, options);

    return this.prisma.question.create({
      data: {
        conceptId,
        type: options.type === 'conceptual' ? 'open_ended' : 'open_ended',
        prompt: question.prompt,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: options.difficulty,
      },
    });
  }

  /**
   * Evaluate open-ended response
   */
  async evaluateResponse(
    assessmentId: string,
    questionId: string,
    answer: string
  ): Promise<AssessmentResponse> {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new Error(`Question ${questionId} not found`);
    }

    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { user: true },
    });

    if (!assessment) {
      throw new Error(`Assessment ${assessmentId} not found`);
    }

    // Use LLM to evaluate response
    const evaluation = await this.evaluateWithLLM(question, answer);

    // Detect misconceptions
    const misconception = await this.detectMisconceptionFromResponse(
      question,
      answer
    );

    if (misconception) {
      await this.profilingEngine.recordMistake(
        assessment.userId,
        question.conceptId,
        misconception
      );
    }

    // Create response record
    const response = await this.prisma.assessmentResponse.create({
      data: {
        assessmentId,
        questionId,
        answer: { text: answer },
        isCorrect: evaluation.isCorrect,
        score: evaluation.score,
        feedback: evaluation.feedback,
        misconceptionDetected: misconception,
      },
    });

    return response;
  }

  /**
   * Complete assessment and calculate results
   */
  async completeAssessment(assessmentId: string): Promise<AssessmentResult> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        responses: {
          include: {
            question: true,
          },
        },
        user: true,
      },
    });

    if (!assessment) {
      throw new Error(`Assessment ${assessmentId} not found`);
    }

    const totalScore = assessment.responses.reduce(
      (sum, r) => sum + (r.score ?? 0),
      0
    );
    const maxScore = assessment.responses.length * 10; // Assuming 10 points per question
    const percentage = (totalScore / maxScore) * 100;

    const misconceptions = assessment.responses
      .filter(r => r.misconceptionDetected)
      .map(r => r.misconceptionDetected!)
      .filter((v, i, a) => a.indexOf(v) === i); // Unique

    // Generate feedback
    const feedback = await this.generateFeedback(assessment, percentage, misconceptions);

    // Update mastery
    await this.profilingEngine.updateMastery(
      assessment.userId,
      assessment.conceptId,
      percentage / 100
    );

    // Update assessment
    await this.prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        score: totalScore,
        maxScore,
        completedAt: new Date(),
      },
    });

    return {
      score: totalScore,
      maxScore,
      percentage,
      misconceptions,
      feedback,
      recommendations: this.generateRecommendations(percentage, misconceptions),
    };
  }

  /**
   * Build question generation prompt
   */
  private buildQuestionGenerationPrompt(
    concept: any,
    options: QuestionGenerationOptions
  ): string {
    let prompt = `Generate a ${options.type} question about: ${concept.title}\n\n`;

    prompt += `Concept details:\n`;
    if (concept.intuition) prompt += `- Intuition: ${concept.intuition}\n`;
    if (concept.formalDef) prompt += `- Formal: ${concept.formalDef}\n`;
    if (concept.applications) prompt += `- Applications: ${concept.applications}\n`;

    prompt += `\nRequirements:\n`;
    prompt += `- Difficulty level: ${options.difficulty}/5\n`;
    prompt += `- Type: ${options.type}\n`;
    prompt += `- Must test conceptual understanding, not memorization\n`;
    
    if (options.requireReasoning) {
      prompt += `- Must require explanation of reasoning\n`;
    }

    prompt += `\nFormat your response as:\n`;
    prompt += `PROMPT: [the question]\n`;
    prompt += `EXPLANATION: [brief explanation of what makes a good answer]\n`;

    return prompt;
  }

  /**
   * Parse generated question (simplified)
   */
  private parseGeneratedQuestion(
    content: string,
    concept: any,
    options: QuestionGenerationOptions
  ): { prompt: string; options: any; correctAnswer: any; explanation: string } {
    const promptMatch = content.match(/PROMPT:\s*(.+?)(?=EXPLANATION:|$)/s);
    const explanationMatch = content.match(/EXPLANATION:\s*(.+?)$/s);

    return {
      prompt: promptMatch?.[1]?.trim() ?? content,
      options: null,
      correctAnswer: { type: 'open_ended' },
      explanation: explanationMatch?.[1]?.trim() ?? 'Evaluate based on understanding.',
    };
  }

  /**
   * Evaluate response with LLM
   */
  private async evaluateWithLLM(
    question: Question,
    answer: string
  ): Promise<{ isCorrect: boolean; score: number; feedback: string }> {
    const prompt = `Evaluate this student's answer to the following question.

Question: ${question.prompt}

Student's Answer: ${answer}

${question.explanation ? `Expected approach: ${question.explanation}` : ''}

Provide:
1. Is the answer correct? (true/false)
2. Score out of 10
3. Constructive feedback

Format:
CORRECT: [true/false]
SCORE: [0-10]
FEEDBACK: [your feedback]`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a fair and encouraging educator who evaluates understanding, not just correctness.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = completion.choices[0]?.message?.content ?? '';
    const correctMatch = content.match(/CORRECT:\s*(true|false)/i);
    const scoreMatch = content.match(/SCORE:\s*(\d+)/i);
    const feedbackMatch = content.match(/FEEDBACK:\s*(.+?)(?=\n|$)/s);

    return {
      isCorrect: correctMatch?.[1]?.toLowerCase() === 'true',
      score: parseInt(scoreMatch?.[1] ?? '5', 10),
      feedback: feedbackMatch?.[1]?.trim() ?? 'Good effort. Consider reviewing the concept.',
    };
  }

  /**
   * Detect misconception from response
   */
  private async detectMisconceptionFromResponse(
    question: Question,
    answer: string
  ): Promise<string | undefined> {
    const concept = await this.prisma.concept.findUnique({
      where: { id: question.conceptId },
    });

    if (!concept?.commonMisconceptions) return undefined;

    const misconceptions = JSON.parse(concept.commonMisconceptions) as string[];

    // Simple keyword matching (can be enhanced)
    for (const misconception of misconceptions) {
      if (answer.toLowerCase().includes(misconception.toLowerCase())) {
        return misconception;
      }
    }

    return undefined;
  }

  /**
   * Generate feedback for assessment
   */
  private async generateFeedback(
    assessment: any,
    percentage: number,
    misconceptions: string[]
  ): Promise<string> {
    if (percentage >= 80) {
      return 'Excellent work! You have a strong understanding of this concept.';
    } else if (percentage >= 60) {
      return 'Good progress! You understand the basics, but there\'s room to deepen your understanding.';
    } else {
      return 'Keep practicing! Focus on understanding the core intuition before moving to applications.';
    }
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    percentage: number,
    misconceptions: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (percentage < 70) {
      recommendations.push('Review the core intuition and mental models');
      recommendations.push('Practice with simpler examples first');
    }

    if (misconceptions.length > 0) {
      recommendations.push('Address the identified misconceptions');
      recommendations.push('Connect to prerequisite concepts');
    }

    if (percentage >= 80) {
      recommendations.push('Explore advanced applications');
      recommendations.push('Try teaching the concept to someone else (Feynman technique)');
    }

    return recommendations;
  }
}

