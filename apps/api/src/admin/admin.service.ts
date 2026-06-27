import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const PRICE_MONTHLY = 29;
const PRICE_YEARLY = 290;

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        isAdmin: true,
        subscription: {
          select: {
            status: true,
            stripePriceId: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const [totalUsers, activeSubscriptions] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.subscription.findMany({
        where: { status: { in: ['ACTIVE', 'TRIALING'] } },
        select: { stripePriceId: true },
      }),
    ]);

    const monthlyPriceId = process.env.STRIPE_PRICE_ID_MONTHLY;
    const yearlyPriceId = process.env.STRIPE_PRICE_ID_YEARLY;

    const mrr = activeSubscriptions.reduce((sum, sub) => {
      if (sub.stripePriceId === monthlyPriceId) return sum + PRICE_MONTHLY;
      if (sub.stripePriceId === yearlyPriceId) return sum + PRICE_YEARLY / 12;
      return sum;
    }, 0);

    return {
      totalUsers,
      activeSubscriptions: activeSubscriptions.length,
      mrr: Math.round(mrr * 100) / 100,
    };
  }
}
