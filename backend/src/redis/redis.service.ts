import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD', ''),
      maxRetriesPerRequest: null, // Required by BullMQ
      retryStrategy: (times: number) => {
        if (times > 10) {
          this.logger.error('Redis max retries exceeded');
          return null;
        }
        return Math.min(times * 200, 5000);
      },
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err.message}`);
    });
  }

  async onModuleInit() {
    try {
      await this.client.ping();
      this.logger.log('✅ Redis connected successfully');
    } catch (err) {
      this.logger.warn(
        '⚠️  Redis not available — falling back to DB-only mode',
      );
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  /** Get the raw ioredis client (needed by BullMQ) */
  getClient(): Redis {
    return this.client;
  }

  /** Get a value by key */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /** Set a value */
  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  /** Set a value with TTL (seconds) */
  async setex(key: string, ttl: number, value: string): Promise<void> {
    await this.client.setex(key, ttl, value);
  }

  /** Delete a key */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /** Check if Redis is connected */
  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }
}
