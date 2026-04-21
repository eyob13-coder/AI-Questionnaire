import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Validates a Better Auth session token against the database.
   * Returns the user if the session is valid and not expired.
   */
  async validateSessionToken(token: string) {
    if (!token) {
      throw new UnauthorizedException('No session token provided');
    }

    const session = await this.prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }

    if (new Date(session.expiresAt) < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    return session.user;
  }

  /**
   * Gets user profile by ID (used after session validation).
   */
  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company,
      image: user.image,
    };
  }
}
