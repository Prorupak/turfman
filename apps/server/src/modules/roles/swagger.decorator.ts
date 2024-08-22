import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { RoleDto } from './dtos/role.dto';

export const GetAllRolesDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get all roles' }),
    ApiResponse({
      status: 200,
      description: 'List of all roles',
      type: [RoleDto],
    }),
  );
};

export const GetRoleByIdDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get role by ID' }),
    ApiParam({
      name: 'id',
      description:
        'The unique identifier of the role, should be a valid MongoDB ObjectId',
      example: '60b8d2958e4e1f001f8f2a5d',
    }),
    ApiResponse({
      status: 200,
      description: 'Details of the role',
      type: RoleDto,
    }),
    ApiNotFoundResponse({
      status: 404,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Entity not found' },
        },
      },
    }),
  );
};

export const CreateRoleDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create role' }),
    ApiBody({
      description: 'Request body data',
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Admin' },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Created details of the role',
      type: RoleDto,
    }),
  );
};

export const UpdateRoleDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create role' }),
    ApiParam({
      name: 'id',
      description:
        'The unique identifier of the role, should be a valid MongoDB ObjectId',
      example: '60b8d2958e4e1f001f8f2a5d',
    }),
    ApiBody({
      description: 'Request body data',
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Admin' },
          id: { type: 'string', example: '60b8d2958e4e1f001f8f2a5d' },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Updated details of the role',
      type: RoleDto,
    }),
  );
};

export const DeleteRoleDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a role by ID' }),
    ApiParam({
      name: 'id',
      description:
        'The unique identifier of the role to delete, should be a valid MongoDB ObjectId',
      example: '60b8d2958e4e1f001f8f2a5d',
    }),
    ApiBody({
      description: 'Request body data',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '60b8d2958e4e1f001f8f2a5d' },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'The role has been successfully deleted.',
      type: RoleDto,
    }),
    ApiNotFoundResponse({
      status: 404,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Entity not found' },
        },
      },
    }),
    ApiBadRequestResponse({
      status: 400,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Cannot delete a default role' },
        },
      },
    }),
  );
};

export const SortRoleDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update the sort order of a role by ID' }),
    ApiParam({
      name: 'id',
      description:
        'The unique identifier of the role to update, should be a valid MongoDB ObjectId',
      example: '60b8d2958e4e1f001f8f2a5d',
    }),
    ApiBody({
      description: 'Request body data',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '60b8d2958e4e1f001f8f2a5d' },
          sort: { type: 'number', example: 2 },
        },
      },
    }),
    ApiOkResponse({
      description: 'The role with updated sort order',
      type: RoleDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid sort order or no change detected',
    }),
    ApiBadRequestResponse({
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: {
            type: 'string',
            example: 'Invalid sort order or no change detected',
          },
        },
      },
    }),
    ApiNotFoundResponse({
      status: 404,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Entity not found' },
        },
      },
    }),
  );
};
