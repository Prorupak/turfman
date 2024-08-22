import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Category } from './schemas/category.schema';

export const FindAllCategoriesSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all categories with advanced filtering and sorting',
    }),
    ApiOkResponse({
      status: 200,
      description: 'List of categories',
      isArray: true,
    }),
  );
};

export const FineOneCategorySwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get a specific category by ID or slug' }),
    ApiOkResponse({
      status: 200,
      description: 'The found category',
      type: Category,
    }),
    ApiNotFoundResponse({ status: 404, description: 'Category not found' }),
  );
};

export const CreateCategorySwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new category' }),
    ApiOkResponse({
      status: 201,
      description: 'The category has been successfully created.',
      type: Category,
    }),
  );
};

export const UpdateCategorySwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update an existing category by ID' }),
    ApiOkResponse({
      status: 200,
      description: 'The category has been successfully updated.',
      type: Category,
    }),
    ApiNotFoundResponse({ status: 404, description: 'Category not found' }),
  );
};

export const DeleteCategorySwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a category by ID' }),
    ApiOkResponse({
      status: 200,
      description: 'The category has been successfully deleted.',
    }),
    ApiNotFoundResponse({ status: 404, description: 'Category not found' }),
  );
};
