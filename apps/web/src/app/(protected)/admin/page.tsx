import { redirect } from 'next/navigation';
import { getAdminUsers, getAdminStats } from '@/app/actions/admin';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  TRIALING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  CANCELED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  PAST_DUE:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

export default async function AdminPage() {
  const [users, stats] = await Promise.all([getAdminUsers(), getAdminStats()]);

  if (!users || !stats) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Admin</h2>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-6">
          <p className="text-sm text-foreground/60">Total Users</p>
          <p className="mt-1 text-3xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-6">
          <p className="text-sm text-foreground/60">Active Subscriptions</p>
          <p className="mt-1 text-3xl font-bold">{stats.activeSubscriptions}</p>
        </div>
        <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-6">
          <p className="text-sm text-foreground/60">MRR</p>
          <p className="mt-1 text-3xl font-bold">
            ${stats.mrr.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-xl border border-foreground/10">
        <div className="border-b border-foreground/10 px-6 py-4">
          <h3 className="font-semibold">Users ({users.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-foreground/10 text-left text-foreground/50">
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Subscription</th>
                <th className="px-6 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(
                (user: {
                  id: string;
                  email: string;
                  name: string | null;
                  isAdmin: boolean;
                  createdAt: string;
                  subscription: {
                    status: string;
                    currentPeriodEnd: string;
                    cancelAtPeriodEnd: boolean;
                  } | null;
                }) => (
                  <tr
                    key={user.id}
                    className="border-b border-foreground/5 last:border-0 hover:bg-foreground/[0.02]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.email}
                        {user.isAdmin && (
                          <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-xs text-foreground/60">
                            admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground/60">
                      {user.name ?? '—'}
                    </td>
                    <td className="px-6 py-4">
                      {user.subscription ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              statusColors[user.subscription.status] ?? ''
                            }`}
                          >
                            {user.subscription.status}
                          </span>
                          {user.subscription.cancelAtPeriodEnd && (
                            <span className="text-xs text-foreground/40">
                              cancels{' '}
                              {new Date(
                                user.subscription.currentPeriodEnd,
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-foreground/60">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
