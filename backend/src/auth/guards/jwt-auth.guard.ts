import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { Request } from 'express';

const SESSION_CACHE_TTL = 300; // 5 minutes
const SESSION_CACHE_PREFIX = 'session:';

/**
 * Guard that validates Better Auth session tokens.
 * Checks for the session token in:
 * 1. Authorization header: "Bearer <token>"
 * 2. Cookie: "better-auth.session_token"
 *
 * Uses Redis to cache validated sessions to reduce DB load.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Extract token from Authorization header or cookie
    let token: string | undefined;

    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    if (!token) {
      const cookieToken = (
        request.cookies as Record<string, string> | undefined
      )?.['better-auth.session_token'];
      if (cookieToken) {
        token = cookieToken;
      }
    }

    if (!token) {
      throw new UnauthorizedException('No session token provided');
    }

    // Try Redis cache first
    let user: Record<string, unknown> | null = null;

    try {
      const cached = await this.redis.get(`${SESSION_CACHE_PREFIX}${token}`);
      if (cached) {
        user = JSON.parse(cached);
      }
    } catch {
      // Redis unavailable — fall through to DB
    }

    if (!user) {
      // Validate session against the database
      const session = await this.prisma.session.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!session || new Date(session.expiresAt) < new Date()) {
        throw new UnauthorizedException('Invalid or expired session');
      }

      user = session.user as unknown as Record<string, unknown>;

      // Cache in Redis
      try {
        await this.redis.setex(
          `${SESSION_CACHE_PREFIX}${token}`,
          SESSION_CACHE_TTL,
          JSON.stringify(user),
        );
      } catch {
        // Redis unavailable — non-critical
      }
    }

    // Attach user to request
    (request as Request & { user: typeof user }).user = user;

    return true;
  }
}
