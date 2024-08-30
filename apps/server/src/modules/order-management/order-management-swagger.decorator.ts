import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { Order } from './schemas/order-management.schema';

export const CreateOrderResponseSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new order',
      description:
        'Creates a new order with product items, user information, and delivery details.',
    }),
    ApiResponse({
      status: 201,
      description: 'The order has been successfully created.',
      type: Order,
    }),
  );
};

export const UpdateOrderResponseSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Update an existing order',
      description:
        'Updates an existing order with new product items, quantities, or delivery details.',
    }),
    ApiResponse({
      status: 200,
      description: 'The order has been successfully updated.',
      type: Order,
    }),
  );
};

export const CancelOrderResponseSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Cancel an order',
      description: 'Cancels an existing order and releases the reserved stock.',
    }),
    ApiResponse({
      status: 200,
      description: 'The order has been successfully canceled.',
    }),
  );
};

export const UpdateOrderStatusResponseSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Update order status',
      description:
        'Updates the status of an order (e.g., from "Pending" to "Completed").',
    }),
    ApiResponse({
      status: 200,
      description: 'The order status has been successfully updated.',
      type: Order,
    }),
  );
};

export const GetSingleOrderResponseSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get a single order by ID' }),
    ApiResponse({
      status: 200,
      description: 'The order with the specified ID',
    }),
    ApiResponse({ status: 404, description: 'Order not found' }),
  );
};
export const GetAllOrdersResponseSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all orders with optional filters, sorting, and search',
    }),
    ApiResponse({
      status: 200,
      description: 'List of orders',
      isArray: true,
    }),
  );
};
