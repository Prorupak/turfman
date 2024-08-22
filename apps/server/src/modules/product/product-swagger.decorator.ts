import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { PaginatedProductDetailsResponseDto } from './dto/product-reponse.dto';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { Product } from './schemas/product.schema';

export const FindAllProductsSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all products with filtering, sorting, and pagination',
    }),
    ApiOkResponse({
      status: 200,
      description: 'List of products',
      isArray: true,
      type: PaginatedProductDetailsResponseDto,
    }),
    ApiBadRequestResponse({
      status: 400,
      description: 'Invalid query parameters',
    }),
  );
};

export const SingleProductResponseSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get a specific product by ID' }),
    ApiOkResponse({
      status: 200,
      description: 'The product with the specified ID',
      type: SingleProductResponseSwaggerDocs,
    }),
    ApiNotFoundResponse({ status: 404, description: 'Product not found' }),
    ApiBadRequestResponse({
      status: 400,
      description: 'Invalid query parameters',
    }),
  );
};

export const CreateProductResponseSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new product' }),
    ApiOkResponse({
      status: 201,
      description: 'The product has been successfully created.',
      type: Product,
    }),
  );
};

export const UpdateProductResponseSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update an existing product by ID' }),
    ApiOkResponse({
      status: 200,
      description: 'The product has been successfully updated.',
    }),
    ApiNotFoundResponse({ status: 404, description: 'Product not found' }),
    ApiConflictResponse({
      status: 409,
      description:
        'Product has been modified by another process (version conflict).',
      type: Product,
    }),
  );
};

export const DeleteProductResponseSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a product by ID' }),
    ApiOkResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'The product has been successfully deleted.',
    }),
    ApiNotFoundResponse({ status: 404, description: 'Product not found' }),
    ApiConflictResponse({
      status: 409,
      description:
        'Product has been modified by another process (version conflict).',
    }),
  );
};
