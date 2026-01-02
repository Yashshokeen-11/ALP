'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Auto sign in after sign up
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      // Better error handling for rate limits
      if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
        setError('[ERROR: RATE_LIMIT_EXCEEDED] Please wait a few minutes before trying again. This usually happens during development when testing multiple times.');
      } else {
        setError(`[ERROR] ${error.message || 'Failed to sign up'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
        setError('[ERROR: RATE_LIMIT_EXCEEDED] Please wait a few minutes before trying again.');
      } else {
        setError(`[ERROR] ${error.message || 'Failed to sign in with Google'}`);
      }
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSignUp}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="font-mono text-sm">[EMAIL_INPUT]</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="user@domain.com"
          className="font-mono border-2 border-primary/20 focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="font-mono text-sm">[PASSWORD_INPUT]</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="font-mono border-2 border-primary/20 focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="font-mono text-sm">[CONFIRM_PASSWORD]</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="font-mono border-2 border-primary/20 focus:border-primary"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full font-mono border-2"
      >
        {loading ? '[PROCESSING...]' : '[REGISTER_USER]'}
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground font-mono">[ALREADY_REGISTERED?] </span>
        <Link href="/auth/signin" className="text-primary hover:underline font-mono">
          [SIGN_IN]
        </Link>
      </div>

      <div className="relative my-6">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="px-2 bg-background text-xs font-mono text-muted-foreground">[OR]</span>
        </div>
      </div>

      <Button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        variant="outline"
        className="w-full font-mono border-2"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        [GOOGLE_AUTH]
      </Button>
    </form>
  );
}

