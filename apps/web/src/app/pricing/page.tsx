import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createCheckout } from '@/app/actions/stripe';

const plans = [
  {
    name: 'Monthly',
    price: '$29',
    interval: '/month',
    priceId: process.env.STRIPE_PRICE_ID_MONTHLY!,
    features: [
      'Full source code',
      'NestJS + Next.js boilerplate',
      'Supabase Auth (Email, Google, Magic Link)',
      'Stripe subscriptions + webhooks',
      'AWS ECS deploy config',
      'Docker Compose for local dev',
      'Claude API integration example',
      'Email support',
    ],
  },
  {
    name: 'Yearly',
    price: '$290',
    interval: '/year',
    priceId: process.env.STRIPE_PRICE_ID_YEARLY!,
    badge: 'Best value — save 17%',
    highlight: true,
    features: [
      'Everything in Monthly',
      'Priority support',
      '12 months of updates',
      'Private Discord access',
    ],
  },
];

const faqs = [
  {
    q: 'What do I get when I purchase?',
    a: 'Full access to the source code repository. You can use it for personal and commercial projects.',
  },
  {
    q: 'Do I need AWS experience to use this?',
    a: 'The AWS deploy config (ECS + Fargate + ALB) is included with step-by-step instructions. Basic familiarity with AWS helps, but is not required.',
  },
  {
    q: 'Can I use this for multiple projects?',
    a: 'Yes. Once purchased, you can use the boilerplate as the foundation for as many projects as you like.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'If the boilerplate does not work as described, contact support within 7 days for a full refund.',
  },
];

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-foreground/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-semibold">
            NestSaaS
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {user ? (
              <Link href="/dashboard" className="hover:text-foreground/70">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="hover:text-foreground/70">
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-foreground px-4 py-2 text-background hover:bg-foreground/90"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="mb-3 text-4xl font-bold">Simple pricing</h1>
          <p className="text-foreground/60">
            One-time purchase. Full source code. No recurring fees unless you
            choose yearly.
          </p>
        </section>

        {/* Plans */}
        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-xl border p-8 ${
                  plan.highlight
                    ? 'border-foreground/30 bg-foreground/[0.03]'
                    : 'border-foreground/10'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                    {plan.badge}
                  </span>
                )}
                <h2 className="text-xl font-semibold">{plan.name}</h2>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-foreground/50">{plan.interval}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 text-green-500">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <form
                  action={async () => {
                    'use server';
                    await createCheckout(plan.priceId);
                  }}
                  className="mt-8"
                >
                  <button
                    type="submit"
                    className={`w-full rounded-lg py-3 font-medium transition-colors ${
                      plan.highlight
                        ? 'bg-foreground text-background hover:bg-foreground/90'
                        : 'border border-foreground/20 hover:bg-foreground/5'
                    }`}
                  >
                    Get started
                  </button>
                </form>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-dashed border-foreground/20 bg-foreground/[0.02] p-4 text-center text-sm text-foreground/50">
            <p className="font-medium text-foreground/70">Demo — use Stripe test card</p>
            <p className="mt-1 font-mono">4242 4242 4242 4242 · Any future date · Any CVC</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-foreground/10 py-24">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="mb-10 text-center text-2xl font-bold">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <h3 className="mb-2 font-medium">{faq.q}</h3>
                  <p className="text-sm text-foreground/60">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-foreground/10 py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-foreground/40">
          NestSaaS — Questions?{' '}
          <a href="mailto:support@nestsaas.com" className="hover:text-foreground/70">
            Contact support
          </a>
        </div>
      </footer>
    </div>
  );
}
