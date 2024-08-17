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
import { FindOneParams } from 'src/common/dtos';
import { AppError } from 'src/common/errors';

import { ChangeUserRolesDto, SearchUsersDto } from './dtos';
import { UsersService } from './users.service';
import { messages } from 'src/constants/messages';
import { Roles } from 'src/decorators/auth';
import { ApiName } from 'src/decorators/openapi';

@Roles('Administrator')
@ApiName()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAll(@Query() dto: SearchUsersDto) {
    return this.usersService.findAll(dto);
  }

  @Get(':id')
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeRoles(@Body() dto: ChangeUserRolesDto) {
    await this.usersService.changeRoles(dto);
  }
}
