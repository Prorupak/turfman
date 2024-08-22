import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { SearchCategoriesDto } from './dtos/query.dto';
import { Category } from './schemas/category.schema';
import { FindOneParams } from 'common/dtos';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { Public, Roles, User } from 'decorators/auth';
import { UserRoles } from 'modules/roles/constants';
import { ApiName } from 'decorators/openapi';
import {
  CreateCategorySwaggerDocs,
  DeleteCategorySwaggerDocs,
  FindAllCategoriesSwaggerDocs,
  FineOneCategorySwaggerDocs,
  UpdateCategorySwaggerDocs,
} from './category-swagger.decorator';
import { SecureEndpoint } from 'guards';

@ApiName('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @Public()
  @FindAllCategoriesSwaggerDocs()
  async findAll(@Query() query: SearchCategoriesDto): Promise<Category[]> {
    return await this.categoryService.findAll(query);
  }

  @Get(':idOrSlug')
  @Public()
  @FineOneCategorySwaggerDocs()
  async findOne(@Param('idOrSlug') idOrSlug: string): Promise<Category> {
    const category = await this.categoryService.findOne(idOrSlug);
    if (!category) {
      throw new NotFoundException(`Category with ID ${idOrSlug} not found`);
    }
    return category;
  }

  @Post()
  @Roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN)
  @SecureEndpoint.apply()
  @CreateCategorySwaggerDocs()
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @User('id') userId: string,
  ): Promise<Category> {
    return await this.categoryService.create(userId, createCategoryDto);
  }

  @Patch(':id')
  @SecureEndpoint.apply()
  @Roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN)
  @UpdateCategorySwaggerDocs()
  async update(
    @Param() params: FindOneParams.MongoId,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return await this.categoryService.update(params.id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN)
  @SecureEndpoint.apply()
  @DeleteCategorySwaggerDocs()
  async remove(@Param() params: FindOneParams.MongoId): Promise<void> {
    return await this.categoryService.remove(params.id);
  }
}
