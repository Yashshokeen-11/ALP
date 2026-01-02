import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function Home() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          AI Learning Platform
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Master any subject through first-principles thinking, Socratic questioning,
          and adaptive personalized learning.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/signin">
              Get Started
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/signin">
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

