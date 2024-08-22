import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { VerificationTokensModule } from './verification-tokens/verification-tokens.module';
import { CategoryModule } from './category/category.module';

const MAIN_APP_MODULES = [
  UsersModule,
  RolesModule,
  AuthModule,
  VerificationTokensModule,
  CategoryModule,
];

@Module({
  imports: MAIN_APP_MODULES,
  exports: MAIN_APP_MODULES,
})
export class MainAppModule {}
