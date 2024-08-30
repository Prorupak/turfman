import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { DeliveryConfiguration } from './schema/delivery-configuration.schema';

export const CreateDeliveryConfigurationResponseSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new delivery configuration',
      description:
        'Creates a delivery configuration for a specific category with flat rates or region-specific rates.',
    }),
    ApiResponse({
      status: 201,
      description: 'The delivery configuration has been successfully created.',
      type: DeliveryConfiguration,
    }),
    ApiResponse({ status: 404, description: 'Category not found.' }),
    ApiResponse({
      status: 409,
      description: 'Delivery configuration for the category already exists.',
    }),
  );
};

export const GetAllDeliveryConfigurationResponseSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary:
        'Get all delivery configurations with filtering, sorting, and pagination',
      description:
        'Fetches a list of delivery configurations based on query options like category, active status, and more.',
    }),
    ApiResponse({
      status: 200,
      description: 'List of delivery configurations',
      type: [DeliveryConfiguration],
    }),
  );
};

export const SingleDeliveryConfigurationResponseSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get a specific delivery configuration by ID',
      description:
        'Fetches a delivery configuration by its ID along with the associated category details.',
    }),
    ApiResponse({
      status: 200,
      description: 'The delivery configuration with the specified ID',
      type: DeliveryConfiguration,
    }),
    ApiResponse({
      status: 404,
      description: 'Delivery configuration not found',
    }),
  );
};

export const UpdateDeliveryConfigurationResponseSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Update an existing delivery configuration',
      description:
        'Updates the details of a specific delivery configuration by ID, allowing changes to category, rates, and more.',
    }),
    ApiResponse({
      status: 200,
      description: 'The delivery configuration has been successfully updated.',
      type: DeliveryConfiguration,
    }),
    ApiResponse({
      status: 404,
      description: 'Delivery configuration not found',
    }),
    ApiResponse({
      status: 409,
      description: 'Conflicting delivery configuration for the category',
    }),
  );
};

export const DeleteDeliveryConfigurationResponseSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete a delivery configuration by ID',
      description:
        'Deletes a specific delivery configuration by its ID. The configuration must exist, or an error is returned.',
    }),
    ApiResponse({
      status: 200,
      description: 'The delivery configuration has been successfully deleted.',
    }),
    ApiResponse({
      status: 404,
      description: 'Delivery configuration not found',
    }),
  );
};
