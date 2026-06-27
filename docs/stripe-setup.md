# Stripe Setup

## 1. Create a Stripe account

Go to [stripe.com](https://stripe.com) and create an account.

## 2. Create a product and prices

1. In the Stripe Dashboard, go to **Product catalog** → **Add product**
2. Set a name (e.g. "NestSaaS")
3. Add two prices:
   - **Monthly**: $29 / month (recurring)
   - **Yearly**: $290 / year (recurring)
4. Copy the **Price IDs** (format: `price_xxxx`) and add them to your `.env` files

## 3. Get your API keys

1. Go to **Developers** → **API keys**
2. Copy the **Secret key** (starts with `sk_test_` for test mode)
3. Add it to `apps/api/.env` as `STRIPE_SECRET_KEY`

> Use test mode keys during development. Switch to live mode keys before going to production.

## 4. Set up webhooks

### Local development

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

```bash
stripe login
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

This prints a webhook signing secret (`whsec_...`). Add it to `apps/api/.env` as `STRIPE_WEBHOOK_SECRET`.

Run this command every time you start local development alongside `pnpm dev`.

### Production

1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. Set the URL to `https://your-alb-dns.amazonaws.com/api/stripe/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** and add it to SSM Parameter Store as `/nestsaas/production/STRIPE_WEBHOOK_SECRET`

## 5. Test the payment flow

Use these test card numbers:

| Card | Number |
|---|---|
| Payment succeeds | `4242 4242 4242 4242` |
| Payment requires auth | `4000 0025 0000 3155` |
| Payment declined | `4000 0000 0000 9995` |

Use any future expiry date and any 3-digit CVC.
