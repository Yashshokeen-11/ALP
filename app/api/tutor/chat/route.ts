/**
 * API route for AI tutor chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AITutorEngine } from '@/lib/engines/ai-tutor';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, message, conceptId } = body;

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create session
    let session = await prisma.learningSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      session = await prisma.learningSession.create({
        data: {
          id: sessionId,
          userId: user.id,
          conceptId: conceptId || null,
        },
      });
    }

    // Get concept if provided
    const concept = conceptId
      ? await prisma.concept.findUnique({
          where: { id: conceptId },
        })
      : null;

    if (conceptId && !concept) {
      return NextResponse.json(
        { error: 'Concept not found' },
        { status: 404 }
      );
    }

    // Get user profile for concept
    const userProfile = concept
      ? await prisma.userProfile.findUnique({
          where: {
            userId_conceptId: {
              userId: user.id,
              conceptId: concept.id,
            },
          },
        })
      : null;

    // Get conversation history
    const history = await prisma.sessionMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 20, // Last 20 messages
    });

    // Save user message
    await prisma.sessionMessage.create({
      data: {
        sessionId,
        role: 'user',
        content: message,
      },
    });

    // Initialize AI tutor
    const tutor = new AITutorEngine(prisma);

    // Get user preferences
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
    });

    // Generate tutor response
    const context = {
      concept: concept!,
      userProfile: userProfile || undefined,
      conversationHistory: history.map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      learningStyle: userRecord?.learningStyle || undefined,
      depthPreference: userRecord?.depthPreference || undefined,
    };

    let response: any;

    if (concept) {
      // Check if student is asking a question or responding
      const isQuestion = message.includes('?') || message.length < 50;
      
      if (isQuestion) {
        response = await tutor.provideAdaptiveExplanation(context, message);
      } else {
        response = await tutor.generateSocraticQuestion(context, message);
      }
    } else {
      // General conversation
      response = {
        content: 'I\'d be happy to help! Which concept would you like to learn about?',
        type: 'question',
        shouldRevealAnswer: true,
      };
    }

    // Save assistant response
    await prisma.sessionMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content: response.content,
        metadata: response.metadata || {},
      },
    });

    return NextResponse.json({
      response: response.content,
      type: response.type,
      metadata: response.metadata,
    });
  } catch (error: any) {
    console.error('Tutor chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

