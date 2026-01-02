import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SignUpForm from '@/components/SignUpForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

export default async function SignUpPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Robotic theme background elements */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-primary rotate-45 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-24 h-24 border-2 border-primary rotate-12" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-primary rotate-45" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <Card className="max-w-md w-full relative z-10 border-2 border-primary/20 shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <CardTitle className="text-2xl font-mono">[SYSTEM_AUTH]</CardTitle>
          </div>
          <CardDescription className="font-mono text-xs">
            [REGISTER_NEW_USER]
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  );
}

