import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  CreateRoleDto,
  DeleteRoleDto,
  SearchRoleDto,
  SortRoleDto,
  UpdateRoleDto,
} from './dtos';
import { RolesService } from './roles.service';
import { Roles } from 'decorators/auth';
import { RolesInterceptor } from 'interceptors/auth';
import { ApiName } from 'decorators/openapi';
import {
  CreateRoleDocs,
  DeleteRoleDocs,
  GetAllRolesDocs,
  GetRoleByIdDocs,
  SortRoleDocs,
  UpdateRoleDocs,
} from './swagger.decorator';
import { SecureEndpoint } from 'guards';
import { UserRoles } from './constants';

@Roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN)
@ApiName()
@Controller('roles')
@UseInterceptors(RolesInterceptor)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @SecureEndpoint.apply()
  @GetAllRolesDocs()
  async search() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @SecureEndpoint.apply()
  @GetRoleByIdDocs()
  async getById(@Query() dto: SearchRoleDto) {
    return this.rolesService.findById(dto);
  }

  @Post()
  @SecureEndpoint.apply()
  @CreateRoleDocs()
  async create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Put(':id')
  @SecureEndpoint.apply()
  @UpdateRoleDocs()
  async update(@Body() dto: UpdateRoleDto) {
    return this.rolesService.update(dto);
  }

  @Delete(':id')
  @SecureEndpoint.apply()
  @DeleteRoleDocs()
  async delete(@Body() dto: DeleteRoleDto) {
    return this.rolesService.delete(dto);
  }

  @Patch(':id/sort')
  @SecureEndpoint.apply()
  @SortRoleDocs()
  async sort(@Body() dto: SortRoleDto) {
    return this.rolesService.sort(dto);
  }
}
