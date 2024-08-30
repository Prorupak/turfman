import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CategoryModule } from 'modules/category/category.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { PaginationModule } from 'helpers/pagination/pagination.module';

const mongoose = MongooseModule.forFeature([
  { name: Product.name, schema: ProductSchema },
]);

@Module({
  imports: [CategoryModule, PaginationModule, mongoose],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService, mongoose],
})
export class ProductModule {}
