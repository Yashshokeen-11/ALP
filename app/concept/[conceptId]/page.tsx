import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { KnowledgeGraphEngine } from '@/lib/engines/knowledge-graph';
import Link from 'next/link';
import TutorChat from '@/components/TutorChat';

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href={`/learn/${concept.subject.id}`}
                className="text-primary-600 hover:text-primary-700"
              >
                ← Back to {concept.subject.name}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{concept.title}</h1>
          <p className="text-gray-600">{concept.description}</p>
          
          {mastery > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Mastery:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${mastery * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{Math.round(mastery * 100)}%</span>
              </div>
            </div>
          )}
        </div>

        {!canAccess && missingPrereqs.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-medium mb-2">
              ⚠️ Prerequisites not yet mastered
            </p>
            <p className="text-yellow-700 text-sm">
              Master the following concepts first: {missingPrereqs.join(', ')}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {concept.intuition && (
              <section>
                <h2 className="text-2xl font-semibold mb-3">Intuition</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{concept.intuition}</p>
                </div>
              </section>
            )}

            {concept.mentalModel && (
              <section>
                <h2 className="text-2xl font-semibold mb-3">Mental Model</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{concept.mentalModel}</p>
                </div>
              </section>
            )}

            {concept.formalDef && (
              <section>
                <h2 className="text-2xl font-semibold mb-3">Formal Definition</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{concept.formalDef}</p>
                </div>
              </section>
            )}

            {concept.applications && (
              <section>
                <h2 className="text-2xl font-semibold mb-3">Applications</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{concept.applications}</p>
                </div>
              </section>
            )}

            {concept.commonMisconceptions && (
              <section>
                <h2 className="text-2xl font-semibold mb-3">Common Misconceptions</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {(JSON.parse(concept.commonMisconceptions) as string[]).map(
                      (misconception, i) => (
                        <li key={i}>{misconception}</li>
                      )
                    )}
                  </ul>
                </div>
              </section>
            )}

            {concept.prerequisites.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-3">Prerequisites</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <ul className="space-y-2">
                    {concept.prerequisites.map((prereqRel: any) => (
                      <li key={prereqRel.prerequisiteId}>
                        <Link
                          href={`/concept/${prereqRel.prerequisiteId}`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          {prereqRel.prerequisite.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">AI Tutor</h2>
            <TutorChat subjectId={concept.subjectId} conceptId={concept.id} />
          </div>
        </div>
      </main>
    </div>
  );
}

