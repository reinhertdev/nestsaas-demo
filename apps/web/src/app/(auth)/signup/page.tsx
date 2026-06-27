'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-8 text-center">
        <h2 className="mb-2 text-xl font-semibold">Check your email</h2>
        <p className="text-foreground/60">
          We sent a confirmation link to <strong>{email}</strong>
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm text-foreground/60 underline hover:text-foreground"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-8">
      <h1 className="mb-6 text-center text-2xl font-bold">Create account</h1>

      <form onSubmit={handleSignup} className="space-y-4">
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
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
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

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground/60">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium underline hover:text-foreground"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
