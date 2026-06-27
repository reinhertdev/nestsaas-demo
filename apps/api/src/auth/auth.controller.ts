import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayload } from './strategies/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  async sync(@CurrentUser() payload: JwtPayload) {
    return this.authService.syncUser(
      payload.sub,
      payload.email,
      payload.user_metadata?.full_name,
      payload.user_metadata?.avatar_url,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() payload: JwtPayload) {
    const user = await this.authService.getUserProfile(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @CurrentUser() payload: JwtPayload,
    @Body() body: { name?: string },
  ) {
    return this.authService.updateUser(payload.sub, { name: body.name });
  }
}
