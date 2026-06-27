# NestSaaS — Live Demo

This is the **live demo** of NestSaaS, a full-stack SaaS boilerplate built with NestJS, Next.js, Supabase, Stripe, and AWS ECS.

## Try the demo

Sign in with:

| Field | Value |
|---|---|
| Email | `demo@nestsaas.com` |
| Password | `demo1234` |

Or create your own account — it's a real Supabase auth flow.

### Test Stripe checkout

Go to `/pricing` and use the Stripe test card:

```
Card number : 4242 4242 4242 4242
Expiry      : Any future date
CVC         : Any 3 digits
```

## What you can explore

- **Landing page** — hero, feature grid, competitor comparison, CTA
- **Sign up / Log in** — email+password, Google OAuth, Magic Link
- **Dashboard** — subscription status, account settings
- **Stripe checkout** — full checkout → webhook → subscription activation
- **Customer portal** — manage / cancel subscription via Stripe
- **Admin panel** — user list, MRR stats (demo account has admin access)

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4 |
| Backend | NestJS 11, TypeScript |
| Database | PostgreSQL (Supabase), Prisma 7 |
| Auth | Supabase Auth, JWKS JWT validation |
| Payments | Stripe (test mode) |
| Infra | AWS ECS Fargate, ECR, ALB, CDK |
| Local dev | Docker Compose |
| Monorepo | Turborepo, pnpm |

## Get the boilerplate

**[→ Buy NestSaaS](https://your-store.lemonsqueezy.com/buy/your-product)**

Full source code, AWS CDK infra config, CI/CD pipelines, and docs included.

---

## Running locally

```bash
git clone https://github.com/reinhertdev/nestsaas-demo.git
cd nestsaas-demo
pnpm install

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Fill in your Supabase + Stripe keys

pnpm dev
# web → http://localhost:3000
# api → http://localhost:3001
```
