import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
const MAIN_APP_MODULES = [UsersModule, RolesModule];

@Module({
  imports: [...MAIN_APP_MODULES],
  exports: MAIN_APP_MODULES,
})
export class MainAppModule {}
