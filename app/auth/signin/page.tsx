import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SignInForm from '@/components/SignInForm';

export default async function SignInPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        <SignInForm />
      </div>
    </div>
  );
}

