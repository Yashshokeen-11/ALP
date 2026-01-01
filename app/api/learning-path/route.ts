/**
 * API route for learning path generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { KnowledgeGraphEngine } from '@/lib/engines/knowledge-graph';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json(
        { error: 'Missing subjectId' },
        { status: 400 }
      );
    }

    const engine = new KnowledgeGraphEngine(prisma);
    const path = await engine.generateLearningPath(subjectId, user.id);

    return NextResponse.json(path);
  } catch (error: any) {
    console.error('Learning path error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

