import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { Request } from 'express';

const SESSION_CACHE_TTL = 300; // 5 minutes
const SESSION_CACHE_PREFIX = 'session:';

function isDbConnectionError(error: unknown): boolean {
  const e = error as { code?: string; message?: string };
  const code = e?.code;
  const message = (e?.message || '').toLowerCase();

  return (
    code === 'P1017' ||
    code === 'P1001' ||
    code === 'P1008' ||
    code === 'ETIMEDOUT' ||
    message.includes('server has closed the connection') ||
    message.includes('connection closed') ||
    message.includes('timed out')
  );
}

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

  private normalizeSessionToken(rawToken: string | undefined): string | undefined {
    if (!rawToken) return undefined;
    const trimmed = rawToken.trim();
    if (!trimmed) return undefined;
    const dotIndex = trimmed.indexOf('.');
    return dotIndex > 0 ? trimmed.slice(0, dotIndex) : trimmed;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Extract token from Authorization header or cookie
    let token: string | undefined;

    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    if (!token) {
      const cookies = request.cookies as Record<string, string> | undefined;
      token = cookies?.['better-auth.session_token'] || 
              cookies?.['better-auth.session-token'] || 
              cookies?.['better_auth_session_token'] ||
              cookies?.['__Secure-better-auth.session_token'];
    }

    token = this.normalizeSessionToken(token);

    if (!token) {
      const msg = 'No session token provided';
      this.logger.error(msg);
      throw new UnauthorizedException(msg);
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
      let session: any = null;
      try {
        session = await this.prisma.session.findUnique({
          where: { token },
          include: { user: true },
        });
      } catch (error) {
        if (isDbConnectionError(error)) {
          this.logger.warn('Database unavailable while validating session');
          throw new ServiceUnavailableException(
            'Authentication service is temporarily unavailable. Please retry in a moment.',
          );
        }
        throw error;
      }

      if (!session || new Date(session.expiresAt) < new Date()) {
        const msg = `Invalid or expired session. Found: ${!!session}`;
        this.logger.error(msg);
        throw new UnauthorizedException(msg);
      }

      user = session.user as Record<string, unknown>;

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
