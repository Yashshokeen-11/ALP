import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { KnowledgeGraphEngine } from '@/lib/engines/knowledge-graph';
import Link from 'next/link';
import TutorChat from '@/components/TutorChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default async function ConceptPage({
  params,
}: {
  params: { conceptId: string };
}) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  const concept = await prisma.concept.findUnique({
    where: { id: params.conceptId },
    include: {
      subject: true,
      prerequisites: {
        include: {
          prerequisite: true,
        },
      },
      profiles: {
        where: { userId: user.id },
      },
    },
  });

  if (!concept) {
    return <div>Concept not found</div>;
  }

  const engine = new KnowledgeGraphEngine(prisma);
  const { canAccess, missingPrereqs } = await engine.canAccessConcept(
    params.conceptId,
    user.id
  );

  const mastery = concept.profiles[0]?.masteryScore ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href={`/learn/${concept.subject.id}`}>
                  ← Back to {concept.subject.name}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">{concept.title}</h1>
          {concept.description && (
            <p className="text-muted-foreground">{concept.description}</p>
          )}
          
          {mastery > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Mastery</span>
                <span className="font-semibold text-foreground">{Math.round(mastery * 100)}%</span>
              </div>
              <Progress value={mastery * 100} className="h-2 max-w-xs" />
            </div>
          )}
        </div>

        {!canAccess && missingPrereqs.length > 0 && (
          <Alert className="mb-6">
            <AlertTitle>⚠️ Prerequisites not yet mastered</AlertTitle>
            <AlertDescription>
              Master the following concepts first: {missingPrereqs.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {concept.intuition && (
              <Card>
                <CardHeader>
                  <CardTitle>Intuition</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{concept.intuition}</p>
                </CardContent>
              </Card>
            )}

            {concept.mentalModel && (
              <Card>
                <CardHeader>
                  <CardTitle>Mental Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{concept.mentalModel}</p>
                </CardContent>
              </Card>
            )}

            {concept.formalDef && (
              <Card>
                <CardHeader>
                  <CardTitle>Formal Definition</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{concept.formalDef}</p>
                </CardContent>
              </Card>
            )}

            {concept.applications && (
              <Card>
                <CardHeader>
                  <CardTitle>Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{concept.applications}</p>
                </CardContent>
              </Card>
            )}

            {concept.commonMisconceptions && (
              <Card>
                <CardHeader>
                  <CardTitle>Common Misconceptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-foreground">
                    {(JSON.parse(concept.commonMisconceptions) as string[]).map(
                      (misconception, i) => (
                        <li key={i}>{misconception}</li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}

            {concept.prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {concept.prerequisites.map((prereqRel: any) => (
                      <li key={prereqRel.prerequisiteId}>
                        <Button variant="link" asChild className="p-0 h-auto">
                          <Link href={`/concept/${prereqRel.prerequisiteId}`}>
                            {prereqRel.prerequisite.title}
                          </Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">AI Tutor</h2>
            <TutorChat subjectId={concept.subjectId} conceptId={concept.id} />
          </div>
        </div>
      </main>
    </div>
  );
}

