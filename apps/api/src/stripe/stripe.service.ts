import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
    );
  }

  private async getOrCreateCustomer(userId: string): Promise<string> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await this.stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  async createCheckoutSession(
    userId: string,
    priceId: string,
    trialDays?: number,
  ): Promise<string> {
    const customerId = await this.getOrCreateCustomer(userId);
    const appUrl = this.configService.getOrThrow<string>('NEXT_PUBLIC_APP_URL');

    const params: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=canceled`,
    };

    if (trialDays) {
      params.subscription_data = { trial_period_days: trialDays };
    }

    const session = await this.stripe.checkout.sessions.create(params);
    return session.url!;
  }

  async createPortalSession(userId: string): Promise<string> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (!user.stripeCustomerId) {
      throw new Error('No Stripe customer found');
    }

    const appUrl = this.configService.getOrThrow<string>('NEXT_PUBLIC_APP_URL');
    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/dashboard`,
    });

    return session.url;
  }

  async handleWebhookEvent(payload: Buffer, signature: string) {
    const webhookSecret = this.configService.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );

    console.log(`[Stripe Webhook] ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.onCheckoutCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;
        case 'customer.subscription.updated':
          await this.onSubscriptionUpdated(
            event.data.object as Stripe.Subscription,
          );
          break;
        case 'customer.subscription.deleted':
          await this.onSubscriptionDeleted(
            event.data.object as Stripe.Subscription,
          );
          break;
      }
    } catch (err) {
      console.error(`[Stripe Webhook] Error processing ${event.type}:`, err);
      throw err;
    }
  }

  private subscriptionData(subscription: Stripe.Subscription) {
    const item = subscription.items.data[0];
    return {
      stripeSubscriptionId: subscription.id,
      stripePriceId: item.price.id,
      status: this.mapStatus(subscription.status),
      currentPeriodStart: new Date(item.current_period_start * 1000),
      currentPeriodEnd: new Date(item.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  }

  private async onCheckoutCompleted(session: Stripe.Checkout.Session) {
    if (session.mode !== 'subscription' || !session.subscription) return;

    const subscription = await this.stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: session.customer as string },
    });
    if (!user) return;

    const data = this.subscriptionData(subscription);
    await this.prisma.subscription.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });
  }

  private async onSubscriptionUpdated(subscription: Stripe.Subscription) {
    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: subscription.customer as string },
    });
    if (!user) return;

    const data = this.subscriptionData(subscription);
    await this.prisma.subscription.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });
  }

  private async onSubscriptionDeleted(subscription: Stripe.Subscription) {
    await this.prisma.subscription
      .update({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: 'CANCELED' },
      })
      .catch(() => {});
  }

  private mapStatus(
    status: Stripe.Subscription.Status,
  ): 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | 'TRIALING' | 'UNPAID' {
    const map: Record<string, string> = {
      active: 'ACTIVE',
      past_due: 'PAST_DUE',
      canceled: 'CANCELED',
      incomplete: 'INCOMPLETE',
      trialing: 'TRIALING',
      unpaid: 'UNPAID',
      incomplete_expired: 'CANCELED',
      paused: 'CANCELED',
    };
    return (map[status] ?? 'CANCELED') as ReturnType<typeof this.mapStatus>;
  }
}
