/**
 * AI Tutor Engine
 * 
 * Provides Socratic questioning, first-principles explanations, and adaptive tutoring.
 * Refuses direct answers until student attempts reasoning.
 */

import OpenAI from 'openai';
import { HfInference } from '@huggingface/inference';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient, Concept, UserProfile } from '@prisma/client';
import { UserProfilingEngine } from './user-profiling';
import { KnowledgeGraphEngine } from './knowledge-graph';

export interface TutorContext {
  concept: Concept;
  userProfile?: UserProfile;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  learningStyle?: string;
  depthPreference?: string;
}

export interface TutorResponse {
  content: string;
  type: 'question' | 'explanation' | 'hint' | 'encouragement';
  shouldRevealAnswer: boolean;
  metadata?: {
    reasoningAttempted?: boolean;
    misconceptionDetected?: string;
    nextConceptSuggested?: string;
  };
}

export class AITutorEngine {
  private openai: OpenAI | null = null;
  private hf: HfInference | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private apiProvider: 'huggingface' | 'openai' | 'gemini' | 'fallback';
  private profilingEngine: UserProfilingEngine;
  private knowledgeGraph: KnowledgeGraphEngine;

  constructor(
    private prisma: PrismaClient,
    apiKey?: string
  ) {
    // Check which API to use (priority: Hugging Face > Gemini > OpenAI > Fallback)
    const hfApiKey = process.env.HUGGINGFACE_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const openaiApiKey = apiKey || process.env.OPENAI_API_KEY;

    if (hfApiKey) {
      this.apiProvider = 'huggingface';
      this.hf = new HfInference(hfApiKey);
    } else if (geminiApiKey) {
      this.apiProvider = 'gemini';
      this.gemini = new GoogleGenerativeAI(geminiApiKey);
    } else if (openaiApiKey) {
      this.apiProvider = 'openai';
      this.openai = new OpenAI({ apiKey: openaiApiKey });
    } else {
      this.apiProvider = 'fallback';
    }

    this.profilingEngine = new UserProfilingEngine(prisma);
    this.knowledgeGraph = new KnowledgeGraphEngine(prisma);
  }

  /**
   * Generate Socratic question to guide student thinking
   */
  async generateSocraticQuestion(
    context: TutorContext,
    studentResponse?: string
  ): Promise<TutorResponse> {
    const prompt = this.buildSocraticPrompt(context, studentResponse);
    const messages = [
      {
        role: 'system' as const,
        content: this.getSystemPrompt(),
      },
      ...context.conversationHistory,
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    let content = '';

    if (this.apiProvider === 'huggingface' && this.hf) {
      try {
        const response = await this.hf.chatCompletion({
          model: 'meta-llama/Llama-2-70b-chat-hf',
          messages: messages as any,
          temperature: 0.7,
          max_tokens: 500,
        });
        content = response.choices[0]?.message?.content ?? '';
      } catch (error: any) {
        console.error('Hugging Face API error:', error);
        content = this.getFallbackResponse(context, 'question');
      }
    } else if (this.apiProvider === 'gemini' && this.gemini) {
      try {
        const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
        const geminiMessages = this.convertToGeminiFormat(messages);
        const result = await model.generateContent({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        });
        content = result.response.text();
      } catch (error: any) {
        console.error('Gemini API error:', error);
        content = this.getFallbackResponse(context, 'question');
      }
    } else if (this.apiProvider === 'openai' && this.openai) {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 500,
      });
      content = completion.choices[0]?.message?.content ?? '';
    } else {
      content = this.getFallbackResponse(context, 'question');
    }

    // Detect if student attempted reasoning
    const reasoningAttempted = this.detectReasoningAttempt(studentResponse);

    return {
      content,
      type: 'question',
      shouldRevealAnswer: reasoningAttempted,
      metadata: {
        reasoningAttempted,
      },
    };
  }

  /**
   * Provide first-principles explanation
   */
  async explainFirstPrinciples(
    context: TutorContext
  ): Promise<TutorResponse> {
    const prompt = this.buildFirstPrinciplesPrompt(context);
    const messages = [
      {
        role: 'system' as const,
        content: this.getSystemPrompt(),
      },
      ...context.conversationHistory,
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    let content = '';

    if (this.apiProvider === 'huggingface' && this.hf) {
      try {
        const response = await this.hf.chatCompletion({
          model: 'meta-llama/Llama-2-70b-chat-hf',
          messages: messages as any,
          temperature: 0.6,
          max_tokens: 800,
        });
        content = response.choices[0]?.message?.content ?? '';
      } catch (error: any) {
        console.error('Hugging Face API error:', error);
        content = this.getFallbackResponse(context, 'explanation');
      }
    } else if (this.apiProvider === 'gemini' && this.gemini) {
      try {
        const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
        const geminiMessages = this.convertToGeminiFormat(messages);
        const result = await model.generateContent({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 800,
          },
        });
        content = result.response.text();
      } catch (error: any) {
        console.error('Gemini API error:', error);
        content = this.getFallbackResponse(context, 'explanation');
      }
    } else if (this.apiProvider === 'openai' && this.openai) {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: messages as any,
        temperature: 0.6,
        max_tokens: 800,
      });
      content = completion.choices[0]?.message?.content ?? '';
    } else {
      content = this.getFallbackResponse(context, 'explanation');
    }

    return {
      content,
      type: 'explanation',
      shouldRevealAnswer: true,
    };
  }

  /**
   * Provide adaptive explanation based on student's understanding
   */
  async provideAdaptiveExplanation(
    context: TutorContext,
    studentQuestion: string
  ): Promise<TutorResponse> {
    // Check for misconceptions
    const misconception = await this.detectMisconception(
      context,
      studentQuestion
    );

    if (misconception) {
      await this.profilingEngine.recordMistake(
        context.userProfile?.userId ?? '',
        context.concept.id,
        misconception
      );
    }

    // Determine explanation depth
    const depth = this.determineExplanationDepth(context);

    const prompt = this.buildAdaptivePrompt(context, studentQuestion, depth, misconception);
    const messages = [
      {
        role: 'system' as const,
        content: this.getSystemPrompt(),
      },
      ...context.conversationHistory,
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    let content = '';

    if (this.apiProvider === 'huggingface' && this.hf) {
      try {
        const response = await this.hf.chatCompletion({
          model: 'meta-llama/Llama-2-70b-chat-hf',
          messages: messages as any,
          temperature: 0.6,
          max_tokens: 1000,
        });
        content = response.choices[0]?.message?.content ?? '';
      } catch (error: any) {
        console.error('Hugging Face API error:', error);
        content = this.getFallbackResponse(context, 'explanation');
      }
    } else if (this.apiProvider === 'gemini' && this.gemini) {
      try {
        const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
        const geminiMessages = this.convertToGeminiFormat(messages);
        const result = await model.generateContent({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1000,
          },
        });
        content = result.response.text();
      } catch (error: any) {
        console.error('Gemini API error:', error);
        content = this.getFallbackResponse(context, 'explanation');
      }
    } else if (this.apiProvider === 'openai' && this.openai) {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: messages as any,
        temperature: 0.6,
        max_tokens: 1000,
      });
      content = completion.choices[0]?.message?.content ?? '';
    } else {
      content = this.getFallbackResponse(context, 'explanation');
    }

    return {
      content,
      type: misconception ? 'explanation' : 'explanation',
      shouldRevealAnswer: true,
      metadata: {
        misconceptionDetected: misconception,
      },
    };
  }

  /**
   * System prompt for AI tutor
   */
  private getSystemPrompt(): string {
    return `You are an expert AI tutor focused on first-principles learning and Socratic questioning.

CORE PRINCIPLES:
1. NEVER give direct answers until the student has attempted reasoning
2. Always explain "why" before "what"
3. Use intuition and mental models before formal definitions
4. Ask leading questions that guide discovery
5. Identify and correct misconceptions gently
6. Adapt your explanation depth to the student's level

PEDAGOGICAL APPROACH:
- Start with intuitive understanding
- Build mental models
- Connect to prerequisites
- Show real-world applications
- Address common misconceptions
- Use the Feynman technique (explain simply)

STYLE:
- Conversational and encouraging
- Use analogies and examples
- Break complex ideas into digestible parts
- Celebrate effort, not just correctness
- Ask "What do you think?" before explaining`;
  }

  /**
   * Build Socratic questioning prompt
   */
  private buildSocraticPrompt(
    context: TutorContext,
    studentResponse?: string
  ): string {
    const concept = context.concept;
    const mastery = context.userProfile?.masteryScore ?? 0;

    let prompt = `The student is learning about: ${concept.title}\n\n`;
    
    if (concept.intuition) {
      prompt += `Intuitive context: ${concept.intuition}\n\n`;
    }

    if (studentResponse) {
      prompt += `Student's response: "${studentResponse}"\n\n`;
      prompt += `Generate a Socratic question that:\n`;
      prompt += `- Builds on their thinking (even if partially correct)\n`;
      prompt += `- Guides them toward deeper understanding\n`;
      prompt += `- Doesn't reveal the answer directly\n`;
    } else {
      prompt += `Generate an opening Socratic question that:\n`;
      prompt += `- Sparks curiosity about ${concept.title}\n`;
      prompt += `- Connects to their prior knowledge\n`;
      prompt += `- Encourages reasoning before explanation\n`;
    }

    if (mastery < 0.3) {
      prompt += `- Use simple language (beginner level)\n`;
    } else if (mastery < 0.7) {
      prompt += `- Use intermediate language\n`;
    } else {
      prompt += `- Can be more advanced (they're progressing well)\n`;
    }

    return prompt;
  }

  /**
   * Build first-principles explanation prompt
   */
  private buildFirstPrinciplesPrompt(context: TutorContext): string {
    const concept = context.concept;
    const mastery = context.userProfile?.masteryScore ?? 0;

    let prompt = `Explain "${concept.title}" from first principles.\n\n`;

    prompt += `Structure your explanation as:\n`;
    prompt += `1. Intuition: Start with "why" this concept matters\n`;
    prompt += `2. Mental Model: Build a simple mental model\n`;
    prompt += `3. Prerequisites: Connect to what they already know\n`;
    prompt += `4. Formal Definition: Only after intuition is clear\n`;
    prompt += `5. Applications: Show real-world uses\n`;

    if (concept.commonMisconceptions) {
      prompt += `6. Common Misconceptions: Address these gently\n`;
    }

    if (mastery < 0.3) {
      prompt += `\nUse beginner-friendly language and many analogies.`;
    } else if (mastery < 0.7) {
      prompt += `\nUse intermediate language with some technical terms.`;
    } else {
      prompt += `\nCan be more advanced, but still prioritize understanding over memorization.`;
    }

    return prompt;
  }

  /**
   * Build adaptive explanation prompt
   */
  private buildAdaptivePrompt(
    context: TutorContext,
    question: string,
    depth: 'surface' | 'balanced' | 'deep',
    misconception?: string
  ): string {
    const concept = context.concept;

    let prompt = `Student asked: "${question}"\n\n`;

    if (misconception) {
      prompt += `IMPORTANT: The student has a misconception: ${misconception}\n`;
      prompt += `Gently correct this without making them feel wrong. Build on what they understand.\n\n`;
    }

    prompt += `Provide an explanation that is ${depth} in depth.\n\n`;

    if (depth === 'surface') {
      prompt += `- Focus on intuition and big picture\n`;
      prompt += `- Use simple analogies\n`;
      prompt += `- Avoid technical jargon\n`;
    } else if (depth === 'balanced') {
      prompt += `- Combine intuition with some technical details\n`;
      prompt += `- Use examples and applications\n`;
    } else {
      prompt += `- Deep dive into mechanisms and theory\n`;
      prompt += `- Can include formal definitions and derivations\n`;
      prompt += `- Connect to advanced applications\n`;
    }

    return prompt;
  }

  /**
   * Detect if student attempted reasoning
   */
  private detectReasoningAttempt(response?: string): boolean {
    if (!response) return false;

    const reasoningIndicators = [
      'because',
      'since',
      'if',
      'then',
      'therefore',
      'so',
      'think',
      'reason',
      'why',
      'how',
    ];

    const lowerResponse = response.toLowerCase();
    return reasoningIndicators.some(indicator => lowerResponse.includes(indicator)) ||
           response.length > 20; // Substantial response
  }

  /**
   * Detect misconceptions in student response
   */
  private async detectMisconception(
    context: TutorContext,
    studentResponse: string
  ): Promise<string | undefined> {
    if (!context.concept.commonMisconceptions) return undefined;

    const misconceptions = JSON.parse(
      context.concept.commonMisconceptions
    ) as string[];

    // Simple keyword matching (can be enhanced with LLM)
    for (const misconception of misconceptions) {
      const keywords = misconception.toLowerCase().split(' ');
      if (keywords.some(kw => studentResponse.toLowerCase().includes(kw))) {
        return misconception;
      }
    }

    return undefined;
  }

  /**
   * Convert OpenAI-style messages to Gemini format
   */
  private convertToGeminiFormat(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
    const geminiMessages: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    let systemInstruction = '';

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction = msg.content;
      } else {
        const role = msg.role === 'assistant' ? 'model' : 'user';
        geminiMessages.push({
          role,
          parts: [{ text: msg.content }],
        });
      }
    }

    // Add system instruction to the first user message if present
    if (systemInstruction && geminiMessages.length > 0 && geminiMessages[0].role === 'user') {
      geminiMessages[0].parts[0].text = `${systemInstruction}\n\n${geminiMessages[0].parts[0].text}`;
    }

    return geminiMessages;
  }

  /**
   * Get fallback response when API is not available
   */
  private getFallbackResponse(
    context: TutorContext,
    type: 'question' | 'explanation'
  ): string {
    if (type === 'question') {
      return `That's a great question about ${context.concept.title}! Let me help you think through this. What do you already know about this concept? Try to explain it in your own words first.`;
    } else {
      return `Here's an explanation of ${context.concept.title}:\n\n${context.concept.intuition || context.concept.description || 'This is an important concept to understand. Let me break it down for you.'}\n\n${context.concept.mentalModel ? `Think of it like this: ${context.concept.mentalModel}` : ''}\n\nWould you like me to explain any part in more detail?`;
    }
  }

  /**
   * Determine explanation depth based on user profile
   */
  private determineExplanationDepth(context: TutorContext): 'surface' | 'balanced' | 'deep' {
    const preference = context.depthPreference ?? 'balanced';
    const mastery = context.userProfile?.masteryScore ?? 0;

    if (preference === 'surface' || mastery < 0.3) {
      return 'surface';
    } else if (preference === 'deep' || mastery > 0.7) {
      return 'deep';
    } else {
      return 'balanced';
    }
  }
}

