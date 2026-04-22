import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';

function parseSslConfig(databaseUrl: string): {
  connectionString: string;
  ssl?: pg.PoolConfig['ssl'];
} {
  if (!databaseUrl) {
    return { connectionString: databaseUrl };
  }

  let url: URL;
  try {
    url = new URL(databaseUrl);
  } catch {
    // Fallback: if URL parsing fails, keep the raw URL untouched.
    return { connectionString: databaseUrl };
  }

  const sslMode = url.searchParams.get('sslmode')?.toLowerCase();
  if (sslMode) {
    url.searchParams.delete('sslmode');
  }

  const forceNoVerify =
    process.env.PGSSL_NO_VERIFY === 'true' ||
    process.env.PGSSL_NO_VERIFY === '1';

  let ssl: pg.PoolConfig['ssl'] | undefined;

  if (sslMode && sslMode !== 'disable') {
    if (sslMode === 'verify-ca' || sslMode === 'verify-full') {
      ssl = { rejectUnauthorized: true };
    } else {
      ssl = { rejectUnauthorized: false };
    }
  }

  if (!ssl && url.hostname.endsWith('.prisma.io')) {
    // Prisma Postgres endpoints require SSL.
    ssl = { rejectUnauthorized: false };
  }

  if (ssl && forceNoVerify) {
    ssl = { rejectUnauthorized: false };
  }

  return {
    connectionString: url.toString(),
    ssl,
  };
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: pg.Pool;

  constructor() {
    const rawDatabaseUrl = process.env.DATABASE_URL || '';
    const { connectionString, ssl } = parseSslConfig(rawDatabaseUrl);

    const poolMax = Number.parseInt(process.env.PG_POOL_MAX || '10', 10);

    const pool = new pg.Pool({
      connectionString,
      ssl,
      max: Number.isNaN(poolMax) ? 10 : poolMax,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 15_000,
      keepAlive: true,
      allowExitOnIdle: false,
    });

    pool.on('error', (error: Error) => {
      this.logger.error(`Postgres pool error: ${error.message}`);
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });

    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end().catch(() => undefined);
  }
}
