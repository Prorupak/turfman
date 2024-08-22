import { Logger, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from 'config/config.schema';
import { createClient, RedisClientType } from 'redis';

export const REDIS = 'REDIS';

export const redisProviders: Array<Provider> = [
  {
    provide: REDIS,
    inject: [ConfigService],
    async useFactory(
      configService: ConfigService<Config>,
    ): Promise<RedisClientType> {
      const logger = new Logger('RedisProvider');

      const client: RedisClientType = createClient({
        url: configService.get('REDIS_URL'),
      });

      client.on('connect', () => logger.log('Connected to redis'));
      client.on('reconnecting', () => logger.log('Reconnecting to redis'));

      await client.connect();
      return client;
    },
  },
];
