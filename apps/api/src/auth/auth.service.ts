import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async syncUser(
    supabaseId: string,
    email: string,
    name?: string,
    avatarUrl?: string,
  ) {
    return this.prisma.user.upsert({
      where: { supabaseId },
      create: { supabaseId, email, name, avatarUrl },
      update: { email, name, avatarUrl },
    });
  }

  async getUserBySupabaseId(supabaseId: string) {
    return this.prisma.user.findUnique({
      where: { supabaseId },
    });
  }

  async getUserProfile(supabaseId: string) {
    return this.prisma.user.findUnique({
      where: { supabaseId },
      include: { subscription: true },
    });
  }

  async updateUser(supabaseId: string, data: { name?: string }) {
    return this.prisma.user.update({
      where: { supabaseId },
      data,
    });
  }
}
