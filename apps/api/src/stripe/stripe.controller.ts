import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { AuthService } from '../auth/auth.service';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly authService: AuthService,
  ) {}

  private async resolveUser(payload: JwtPayload) {
    let user = await this.authService.getUserBySupabaseId(payload.sub);
    if (!user) {
      user = await this.authService.syncUser(
        payload.sub,
        payload.email,
        payload.user_metadata?.full_name,
        payload.user_metadata?.avatar_url,
      );
    }
    return user;
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(
    @CurrentUser() payload: JwtPayload,
    @Body() body: { priceId: string; trialDays?: number },
  ) {
    const user = await this.resolveUser(payload);
    const url = await this.stripeService.createCheckoutSession(
      user.id,
      body.priceId,
      body.trialDays,
    );
    return { url };
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  async createPortal(@CurrentUser() payload: JwtPayload) {
    const user = await this.resolveUser(payload);
    const url = await this.stripeService.createPortalSession(user.id);
    return { url };
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) throw new BadRequestException('Missing signature');
    const rawBody = req.rawBody;
    if (!rawBody) throw new BadRequestException('Missing raw body');
    await this.stripeService.handleWebhookEvent(rawBody, signature);
    return { received: true };
  }
}
