import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductsDto } from './dto/query-products';
import { FindOneParams } from 'common/dtos';
import { Public, Roles, User } from 'decorators/auth';
import { UserRoles } from 'modules/roles/constants';
import { SecureEndpoint } from 'guards';
import { Product } from './schemas/product.schema';
import {
  PaginatedProductDetailsResponseDto,
  SingleProductResponseDto,
} from './dto/product-reponse.dto';
import {
  CreateProductResponseSwaggerDocs,
  DeleteProductResponseSwaggerDocs,
  FindAllProductsSwaggerDocs,
  SingleProductResponseSwaggerDocs,
  UpdateProductResponseSwaggerDocs,
} from './product-swagger.decorator';
import { ApiName } from 'decorators/openapi';

@ApiName('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @Public()
  @FindAllProductsSwaggerDocs()
  async findAll(
    @Query() query: SearchProductsDto,
  ): Promise<PaginatedProductDetailsResponseDto> {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @Public()
  @SingleProductResponseSwaggerDocs()
  async findOne(
    @Param() params: FindOneParams.MongoId,
  ): Promise<SingleProductResponseDto> {
    return this.productService.findOne(params.id);
  }

  @Post()
  @Roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN)
  @SecureEndpoint.apply()
  @CreateProductResponseSwaggerDocs()
  async create(
    @Body() createProductDto: CreateProductDto,
    @User('id') userId: string,
  ): Promise<Product> {
    return this.productService.create(userId, createProductDto);
  }

  @Patch(':id')
  @Roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN)
  @SecureEndpoint.apply()
  @UpdateProductResponseSwaggerDocs()
  async update(
    @Param() params: FindOneParams.MongoId,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.update(params.id, updateProductDto);
  }

  @Delete(':id')
  @Roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN)
  @SecureEndpoint.apply()
  @DeleteProductResponseSwaggerDocs()
  async remove(@Param() params: FindOneParams.MongoId) {
    return this.productService.remove(params.id);
  }
}
