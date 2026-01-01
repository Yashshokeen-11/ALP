import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { masteryColor, masteryBgColor } from '@/lib/utils';

export default async function Dashboard() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Get user record
  let userRecord = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!userRecord) {
    // Create user record if doesn't exist
    userRecord = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || null,
      },
    });
  }

  // Get subjects
  const subjects = await prisma.subject.findMany({
    include: {
      concepts: {
        include: {
          profiles: {
            where: { userId: user.id },
          },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-primary-600">
                ALP
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{userRecord.name || userRecord.email}</span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Learning Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject: any) => {
            const totalConcepts = subject.concepts.length;
            const masteredConcepts = subject.concepts.filter(
              (c: any) => c.profiles[0]?.masteryScore >= 0.7
            ).length;
            const progress = totalConcepts > 0 ? (masteredConcepts / totalConcepts) * 100 : 0;

            return (
              <Link
                key={subject.id}
                href={`/learn/${subject.id}`}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h2 className="text-xl font-semibold mb-2">{subject.name}</h2>
                {subject.description && (
                  <p className="text-gray-600 text-sm mb-4">{subject.description}</p>
                )}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-semibold">
                      {masteredConcepts}/{totalConcepts} concepts
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}

          {subjects.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 mb-4">No subjects available yet.</p>
              <p className="text-sm text-gray-400">
                Subjects will appear here once they're added to the platform.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

