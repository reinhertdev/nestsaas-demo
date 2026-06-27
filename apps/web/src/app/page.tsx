import Link from 'next/link';

const features = [
  {
    title: 'NestJS Backend',
    description:
      'Real backend architecture with modules, guards, and dependency injection. Not just API Routes.',
    icon: '⚙️',
  },
  {
    title: 'Supabase Auth',
    description:
      'Email/password, Google OAuth, and Magic Link. JWT validation with JWKS on the NestJS side.',
    icon: '🔐',
  },
  {
    title: 'Stripe Payments',
    description:
      'Checkout sessions, webhook handling, customer portal, and subscription management built in.',
    icon: '💳',
  },
  {
    title: 'AWS ECS Deploy',
    description:
      'Fargate + ECR + ALB infrastructure config included. Not locked into Vercel.',
    icon: '☁️',
  },
  {
    title: 'Docker Compose',
    description:
      'One command to spin up the full stack locally. PostgreSQL, API, and web all included.',
    icon: '🐳',
  },
  {
    title: 'Claude API Sample',
    description:
      'Working example of how to wire up an AI feature using the Anthropic SDK.',
    icon: '🤖',
  },
];

const stack = [
  'Next.js 16',
  'NestJS 11',
  'TypeScript',
  'Prisma',
  'Supabase',
  'Stripe',
  'Tailwind CSS',
  'Docker',
  'AWS ECS',
  'Turborepo',
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-foreground/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold">NestSaaS</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/pricing" className="hover:text-foreground/70">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-foreground/70">
              Log in
            </Link>
            <a
              href={process.env.NEXT_PUBLIC_PURCHASE_URL ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-foreground px-4 py-2 text-background hover:bg-foreground/90"
            >
              Buy NestSaaS →
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs text-foreground/60">
            NestJS + Next.js · AWS-ready · Not Vercel-only
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight">
            Ship your SaaS in days,
            <br />
            not months.
          </h1>
          <p className="mb-10 max-w-xl text-lg text-foreground/60">
            A full-stack boilerplate with a real NestJS backend, Supabase auth,
            Stripe payments, and AWS ECS deployment config — all wired together
            and ready to go.
          </p>
          <div className="flex gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-foreground px-6 py-3 font-medium text-background hover:bg-foreground/90"
            >
              Get started free
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-foreground/20 px-6 py-3 font-medium hover:bg-foreground/5"
            >
              View pricing
            </Link>
          </div>
        </section>

        {/* Tech stack */}
        <section className="border-y border-foreground/10 bg-foreground/[0.02] py-8">
          <div className="mx-auto max-w-5xl px-4">
            <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-foreground/40">
              Built with
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {stack.map((name) => (
                <span
                  key={name}
                  className="rounded-md border border-foreground/10 px-3 py-1.5 text-sm text-foreground/70"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-5xl px-4 py-24">
          <h2 className="mb-4 text-center text-3xl font-bold">
            Everything you need to ship
          </h2>
          <p className="mb-16 text-center text-foreground/60">
            Stop wiring up auth and payments from scratch. Start with a
            production-ready foundation.
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-foreground/10 p-6"
              >
                <div className="mb-3 text-2xl">{f.icon}</div>
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm text-foreground/60">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Differentiator */}
        <section className="border-y border-foreground/10 bg-foreground/[0.02] py-24">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="mb-6 text-3xl font-bold">
              Why not just use ShipFast?
            </h2>
            <div className="grid gap-6 text-left sm:grid-cols-2">
              <div className="rounded-xl border border-foreground/10 bg-background p-6">
                <p className="mb-2 text-sm font-medium text-foreground/40">
                  Others
                </p>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li>❌ Next.js API Routes only</li>
                  <li>❌ Vercel deployment assumed</li>
                  <li>❌ No real backend separation</li>
                  <li>❌ Hard to scale beyond MVP</li>
                </ul>
              </div>
              <div className="rounded-xl border border-foreground/20 bg-background p-6">
                <p className="mb-2 text-sm font-medium text-foreground/40">
                  NestSaaS
                </p>
                <ul className="space-y-2 text-sm">
                  <li>✅ Real NestJS backend</li>
                  <li>✅ AWS ECS + Fargate config</li>
                  <li>✅ Proper DI and module structure</li>
                  <li>✅ Scales with your team</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to ship?</h2>
          <p className="mb-8 text-foreground/60">
            Get the full source code and start building today.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href={process.env.NEXT_PUBLIC_PURCHASE_URL ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-foreground px-8 py-3 font-medium text-background hover:bg-foreground/90"
            >
              Buy NestSaaS →
            </a>
            <Link
              href="/login"
              className="rounded-lg border border-foreground/20 px-8 py-3 font-medium hover:bg-foreground/5"
            >
              Try the demo
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-foreground/10 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 text-sm text-foreground/40 sm:flex-row">
          <span>NestSaaS — Full-stack SaaS boilerplate</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-foreground/70">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-foreground/70">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-foreground/70">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
