import { Module } from '@nestjs/common';
import { ConfigModule } from 'config/config.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Config } from 'config/config.schema';
import { CloudStorageModule } from './cloud-storage/cloud-storage.module';
import { MailModule } from './mail/mail.module';

const CORE_MODULES = [
  DatabaseModule,
  RedisModule,
  ConfigModule,
  DatabaseModule,
  RedisModule,
  CloudStorageModule,
  MailModule,
  ScheduleModule.forRoot(),
  BullModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService<Config>) => ({
      redis: configService.get('REDIS_URL'),
      prefix: 'queue',
    }),
    inject: [ConfigService],
  }),
  CacheModule.register({ isGlobal: true }),
];

@Module({
  imports: CORE_MODULES,
  exports: CORE_MODULES,
})
export class CoreModule {}
