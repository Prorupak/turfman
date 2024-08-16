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
import { Roles } from 'src/decorators/auth';
import { RolesInterceptor } from 'src/interceptors/auth';
import { ApiName } from 'src/decorators/openapi';
import {
  CreateRoleDocs,
  DeleteRoleDocs,
  GetAllRolesDocs,
  GetRoleByIdDocs,
  SortRoleDocs,
  UpdateRoleDocs,
} from './swagger.decorator';

@Roles('Administrator')
@ApiName()
@Controller('roles')
@UseInterceptors(RolesInterceptor)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @GetAllRolesDocs()
  async search() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @GetRoleByIdDocs()
  async getById(@Query() dto: SearchRoleDto) {
    return this.rolesService.findById(dto);
  }

  @Post()
  @CreateRoleDocs()
  async create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Put(':id')
  @UpdateRoleDocs()
  async update(@Body() dto: UpdateRoleDto) {
    return this.rolesService.update(dto);
  }

  @Delete(':id')
  @DeleteRoleDocs()
  async delete(@Body() dto: DeleteRoleDto) {
    return this.rolesService.delete(dto);
  }

  @Patch(':id/sort')
  @SortRoleDocs()
  async sort(@Body() dto: SortRoleDto) {
    return this.rolesService.sort(dto);
  }
}
