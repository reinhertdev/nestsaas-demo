import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const jwtUser = request.user;
    if (!jwtUser?.sub) throw new ForbiddenException();

    const user = await this.prisma.user.findUnique({
      where: { supabaseId: jwtUser.sub },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) throw new ForbiddenException('Admin access required');
    return true;
  }
}
