# Environment Variables

## apps/api/.env

### Supabase

| Variable | Description | Where to find |
|---|---|---|
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Public anon key | Supabase Dashboard → Settings → API → Project API Keys |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (keep secret) | Supabase Dashboard → Settings → API → Project API Keys |

### Database

| Variable | Description | Where to find |
|---|---|---|
| `DATABASE_URL` | Pooled connection string for Prisma | Supabase Dashboard → Settings → Database → Connection string → Transaction mode |
| `DIRECT_URL` | Direct connection string for migrations | Supabase Dashboard → Settings → Database → Connection string → Session mode |

> **Why two URLs?** `DATABASE_URL` uses a connection pooler (PgBouncer) which is efficient for API requests. `DIRECT_URL` bypasses the pooler and is required for `prisma migrate`.

### Stripe

| Variable | Description | Where to find |
|---|---|---|
| `STRIPE_SECRET_KEY` | Secret API key | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Stripe Dashboard → Webhooks → your endpoint → Signing secret |
| `STRIPE_PRICE_ID_MONTHLY` | Price ID for the monthly plan | Stripe Dashboard → Product catalog → your product → Prices |
| `STRIPE_PRICE_ID_YEARLY` | Price ID for the yearly plan | Same as above |

> For local development, use the test mode keys (prefix: `sk_test_`).

### App

| Variable | Description | Example |
|---|---|---|
| `API_URL` | Base URL of the NestJS API | `http://localhost:3001` (local) or your ALB DNS name (production) |

---

## apps/web/.env.local

| Variable | Description | Where to find |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Same as `SUPABASE_URL` above | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as `SUPABASE_ANON_KEY` above | Supabase Dashboard |
| `API_URL` | NestJS API URL (server-side) | `http://localhost:3001` (local) |
| `NEXT_PUBLIC_APP_URL` | Public URL of the Next.js app | `http://localhost:3000` (local) |
| `STRIPE_PRICE_ID_MONTHLY` | Same as in API | Stripe Dashboard |
| `STRIPE_PRICE_ID_YEARLY` | Same as in API | Stripe Dashboard |

---

## Production (AWS SSM Parameter Store)

In production, the NestJS API reads secrets from **AWS SSM Parameter Store** instead of `.env`. The CDK stack expects these parameters to exist under `/nestsaas/production/`:

```bash
aws ssm put-parameter --name "/nestsaas/production/DATABASE_URL"              --value "..." --type SecureString
aws ssm put-parameter --name "/nestsaas/production/DIRECT_URL"                --value "..." --type SecureString
aws ssm put-parameter --name "/nestsaas/production/SUPABASE_URL"              --value "..." --type SecureString
aws ssm put-parameter --name "/nestsaas/production/SUPABASE_SERVICE_ROLE_KEY" --value "..." --type SecureString
aws ssm put-parameter --name "/nestsaas/production/STRIPE_SECRET_KEY"         --value "..." --type SecureString
aws ssm put-parameter --name "/nestsaas/production/STRIPE_WEBHOOK_SECRET"     --value "..." --type SecureString
aws ssm put-parameter --name "/nestsaas/production/STRIPE_PRICE_ID_MONTHLY"   --value "..." --type SecureString
aws ssm put-parameter --name "/nestsaas/production/STRIPE_PRICE_ID_YEARLY"    --value "..." --type SecureString
```
