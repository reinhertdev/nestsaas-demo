import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createPortalSession } from '@/app/actions/stripe';
import { updateProfile } from '@/app/actions/auth';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  TRIALING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  CANCELED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  PAST_DUE:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  INCOMPLETE:
    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  UNPAID:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const {
    data: { session },
  } = await supabase.auth.getSession();

  let profile = null;
  if (session) {
    const apiUrl = process.env.API_URL ?? 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: 'no-store',
    });
    if (res.ok) profile = await res.json();
  }

  const sub = profile?.subscription;
  const isActive = sub?.status === 'ACTIVE' || sub?.status === 'TRIALING';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      {/* Subscription banner */}
      {!sub && (
        <div className="flex items-center justify-between rounded-xl border border-foreground/10 bg-foreground/[0.03] px-6 py-4">
          <div>
            <p className="font-medium">You don&apos;t have an active plan</p>
            <p className="text-sm text-foreground/60">
              Upgrade to unlock all features.
            </p>
          </div>
          <Link
            href="/pricing"
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
          >
            View plans
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subscription */}
        <div className="rounded-xl border border-foreground/10 p-6">
          <h3 className="mb-4 font-semibold">Subscription</h3>
          {sub ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/60">Status</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[sub.status] ?? ''}`}
                >
                  {sub.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/60">
                  Current period
                </span>
                <span className="text-sm">
                  {new Date(sub.currentPeriodStart).toLocaleDateString()} –{' '}
                  {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
              {sub.cancelAtPeriodEnd && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                  Cancels on{' '}
                  {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                </div>
              )}
              {isActive && (
                <form action={createPortalSession}>
                  <button
                    type="submit"
                    className="w-full rounded-lg border border-foreground/20 py-2 text-sm font-medium hover:bg-foreground/5"
                  >
                    Manage subscription
                  </button>
                </form>
              )}
            </div>
          ) : (
            <p className="text-sm text-foreground/50">No active subscription</p>
          )}
        </div>

        {/* Account settings */}
        <div className="rounded-xl border border-foreground/10 p-6">
          <h3 className="mb-4 font-semibold">Account</h3>
          <form action={updateProfile} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-foreground/60">
                Email
              </label>
              <input
                type="text"
                value={user.email}
                disabled
                className="w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm text-foreground/50"
              />
            </div>
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm text-foreground/60"
              >
                Display name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={profile?.name ?? ''}
                placeholder="Your name"
                className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Save changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
