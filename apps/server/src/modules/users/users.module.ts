import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/users.schema';
import { Role, RoleSchema } from '../roles/schemas/roles.schema';
import { UserLogins, UserLoginsSchema } from './schemas/user-logins.schema';
import {
  UserRole,
  UserRoleSchema,
} from 'modules/roles/schemas/user-role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: UserLogins.name, schema: UserLoginsSchema },
      { name: UserRole.name, schema: UserRoleSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
