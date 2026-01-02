import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { KnowledgeGraphEngine } from '@/lib/engines/knowledge-graph';
import Link from 'next/link';
import { masteryColor, masteryBgColor } from '@/lib/utils';
import LearningPathView from '@/components/LearningPathView';
import TutorChat from '@/components/TutorChat';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';

export default async function LearnSubjectPage({
  params,
}: {
  params: { subjectId: string };
}) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  const subject = await prisma.subject.findUnique({
    where: { id: params.subjectId },
  });

  if (!subject) {
    return <div>Subject not found</div>;
  }

  const engine = new KnowledgeGraphEngine(prisma);
  const learningPath = await engine.generateLearningPath(params.subjectId, user.id);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/dashboard">
                  ← Back to Dashboard
                </Link>
              </Button>
              <Separator orientation="vertical" />
              <h1 className="text-xl font-semibold text-foreground">{subject.name}</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Learning Path</h2>
            <LearningPathView path={learningPath} userId={user.id} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">AI Tutor</h2>
            <TutorChat subjectId={params.subjectId} />
          </div>
        </div>
      </main>
    </div>
  );
}

