'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const supabase = createClient();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
      await fetch(`${apiUrl}/api/auth/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    }

    router.push('/dashboard');
    router.refresh();
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function handleMagicLink() {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  }

  if (magicLinkSent) {
    return (
      <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-8 text-center">
        <h2 className="mb-2 text-xl font-semibold">Check your email</h2>
        <p className="text-foreground/60">
          We sent a magic link to <strong>{email}</strong>
        </p>
        <button
          onClick={() => setMagicLinkSent(false)}
          className="mt-4 text-sm text-foreground/60 underline hover:text-foreground"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-8">
      <h1 className="mb-6 text-center text-2xl font-bold">Sign in</h1>

      {/* Demo shortcut */}
      <button
        type="button"
        onClick={() => {
          setEmail('demo@nestsaas.com');
          setPassword('demo1234');
        }}
        className="mb-4 w-full rounded-md border border-dashed border-foreground/30 bg-foreground/5 px-4 py-2.5 text-sm font-medium hover:bg-foreground/10"
      >
        Use demo account
      </button>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-foreground/10" />
        <span className="text-xs text-foreground/40">or</span>
        <div className="h-px flex-1 bg-foreground/10" />
      </div>

      <div className="space-y-2">
        <button
          onClick={handleGoogleLogin}
          className="w-full rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5"
        >
          Continue with Google
        </button>
        <button
          onClick={handleMagicLink}
          disabled={loading}
          className="w-full rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5 disabled:opacity-50"
        >
          Send Magic Link
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-foreground/60">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium underline hover:text-foreground">
          Sign up
        </Link>
      </p>
    </div>
  );
}
