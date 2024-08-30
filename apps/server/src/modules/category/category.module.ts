import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { PaginationModule } from 'helpers/pagination/pagination.module';

const mongoose = MongooseModule.forFeature([
  { name: Category.name, schema: CategorySchema },
]);

@Module({
  imports: [PaginationModule, mongoose],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService, mongoose],
})
export class CategoryModule {}
