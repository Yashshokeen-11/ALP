/**
 * API route for adaptation loop
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AdaptationLoop } from '@/lib/engines/adaptation';
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
    const { subjectId, config } = body;

    if (!subjectId) {
      return NextResponse.json(
        { error: 'Missing subjectId' },
        { status: 400 }
      );
    }

    const adaptation = new AdaptationLoop(prisma);
    const result = await adaptation.adapt(user.id, subjectId, config);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Adaptation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

