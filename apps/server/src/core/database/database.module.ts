import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from 'src/config/config.module';
import { Config } from 'src/config/config.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config>) => ({
        uri: configService.getOrThrow('DATABASE_URL'),
        autoIndex: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
