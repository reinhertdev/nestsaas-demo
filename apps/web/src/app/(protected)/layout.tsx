import Link from 'next/link';
import { signOut } from '@/app/actions/auth';
import { createClient } from '@/lib/supabase/server';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let isAdmin = false;
  if (session) {
    const apiUrl = process.env.API_URL ?? 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: 'no-store',
    });
    if (res.ok) {
      const profile = await res.json();
      isAdmin = profile?.isAdmin ?? false;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-foreground/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-semibold">
              NestSaaS
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/dashboard" className="hover:text-foreground/70">
                Dashboard
              </Link>
              <Link href="/pricing" className="hover:text-foreground/70">
                Pricing
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-foreground/40 hover:text-foreground/70"
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
