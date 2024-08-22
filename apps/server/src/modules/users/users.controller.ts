import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FindOneParams } from 'common/dtos';
import { AppError } from 'common/errors';

import { ChangeUserRolesDto, SearchUsersDto } from './dtos';
import { UsersService } from './users.service';
import { messages } from 'constants/messages';
import { Roles } from 'decorators/auth';
import { ApiName } from 'decorators/openapi';
import { SecureEndpoint } from 'guards';
import {
  ChangeUserRolesSwaggerDocs,
  GetAllUsersSwaggerDocs,
  GetUserByIdSwaggerDocs,
} from './users-swagger.decorator';
import { UserRoles } from 'modules/roles/constants';

@Roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN)
@ApiName()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @SecureEndpoint.apply()
  @UsePipes(new ValidationPipe({ transform: true }))
  @GetAllUsersSwaggerDocs()
  async getAll(@Query() dto: SearchUsersDto) {
    return this.usersService.findAll(dto);
  }

  @Get(':id')
  @SecureEndpoint.apply()
  @GetUserByIdSwaggerDocs()
  async getById(@Param() dto: FindOneParams.MongoId) {
    const result = await this.usersService.findByUnique({ id: dto.id });

    if (!result) {
      throw new AppError.NotFound(messages.error.notFoundEntity).setParams({
        entity: 'User',
        id: dto.id,
      });
    }

    return result;
  }

  @Patch(':id/roles')
  @SecureEndpoint.apply()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ChangeUserRolesSwaggerDocs()
  async changeRoles(@Body() dto: ChangeUserRolesDto) {
    await this.usersService.changeRoles(dto);
  }
}
