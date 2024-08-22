import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

export const GetAllUsersSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get a list of users based on filters and pagination.',
    }),
    ApiResponse({
      status: 200,
      description: 'A list of users matching the criteria.',
      schema: {
        type: 'object',
        properties: {
          records: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                username: { type: 'string', example: 'john_doe' },
                displayName: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john.doe@example.com' },
                emailConfirmed: { type: 'boolean', example: true },
                userRoles: { type: 'array', items: { type: 'string' } },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2024-08-20T07:46:38.854Z',
                },
                updatedAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2024-08-20T07:46:38.854Z',
                },
                id: { type: 'string', example: '66c449de0ee4ad22d382f3f1' },
              },
            },
          },
          count: { type: 'number', example: 2 },
          totalCount: { type: 'number', example: 2 },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid query parameters',
    }),
  );
};

export const GetUserByIdSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Retrieve a user by their unique ID' }),
    ApiParam({
      name: 'id',
      description: 'The unique identifier for the user (MongoDB ObjectId)',
      type: String,
      example: '66c449de0ee4ad22d382f3f1',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User found successfully',
      schema: {
        type: 'object',
        properties: {
          username: { type: 'string', example: 'prorupakz' },
          displayName: { type: 'string', example: 'Rupak Sapkota' },
          email: { type: 'string', example: 'sapkotarupak5570@gmail.com' },
          emailConfirmed: { type: 'boolean', example: true },
          userRoles: {
            type: 'array',
            items: { type: 'string', example: '66c47bb69f8abb96e2691909' },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-08-20T11:19:18.721Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-08-21T03:50:10.622Z',
          },
          id: { type: 'string', example: '66c47bb69f8abb96e2691908' },
        },
      },
    }),
    ApiNotFoundResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 404 },
          title: { type: 'string', example: 'Resource not found' },
          message: { type: 'string', example: 'Entity not found' },
          params: {
            type: 'object',
            properties: {
              entity: { type: 'string', example: 'User' },
              id: { type: 'string', example: '66c449de0ee4ad22d382f3f1' },
            },
          },
        },
      },
    }),
  );
};

export const ChangeUserRolesSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Change the roles assigned to a user' }),
    ApiOkResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Roles updated successfully',
    }),
    ApiNotFoundResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 404 },
          title: { type: 'string', example: 'Resource not found' },
          message: { type: 'string', example: 'Entity not found' },
          params: {
            type: 'object',
            properties: {
              entity: { type: 'string', example: 'User' },
              id: { type: 'string', example: '66c449de0ee4ad22d382f3f1' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid input or roles do not exist',
    }),
  );
};
