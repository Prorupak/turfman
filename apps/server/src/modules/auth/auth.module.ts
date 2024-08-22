import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefreshToken,
  RefreshTokenSchema,
} from 'modules/users/schemas/refresh-token.schema';
import { UsersModule } from 'modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Config } from 'config/config.schema';
import { CloudStorageModule } from 'core/cloud-storage/cloud-storage.module';
import { User, UserSchema } from 'modules/users/schemas/users.schema';
import { VerificationTokensModule } from 'modules/verification-tokens/verification-tokens.module';
import { MailModule } from 'core/mail/mail.module';
import { Role, RoleSchema } from 'modules/roles/schemas/roles.schema';
import { JwtStrategy, LocalStrategy } from './strategies';
import {
  UserRole,
  UserRoleSchema,
} from 'modules/roles/schemas/user-role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: UserRole.name, schema: UserRoleSchema },
    ]),
    UsersModule,
    CloudStorageModule,
    VerificationTokensModule,
    MailModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService<Config>) {
        return {
          secret: configService.get('ACCESS_TOKEN_SECRET'),
          signOptions: { expiresIn: configService.get('ACCESS_TOKEN_EXPIRES') },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
