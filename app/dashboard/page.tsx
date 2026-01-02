import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { masteryColor, masteryBgColor } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link 
                href="/dashboard" 
                className="text-xl font-bold text-primary"
              >
                ALP
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-foreground">{userRecord.name || userRecord.email}</span>
              <form action="/auth/signout" method="post">
                <Button
                  type="submit"
                  variant="ghost"
                >
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Your Learning Dashboard</h1>

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
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>{subject.name}</CardTitle>
                    {subject.description && (
                      <CardDescription>{subject.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-foreground">
                          {masteredConcepts}/{totalConcepts} concepts
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {subjects.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground mb-4">No subjects available yet.</p>
              <p className="text-sm text-muted-foreground">
                Subjects will appear here once they're added to the platform.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

