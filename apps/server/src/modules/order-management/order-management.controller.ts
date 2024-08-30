import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { OrderService } from './order-management.service';
import { CreateOrderDto } from './dto/create-order-management.dto';
import { Order } from './schemas/order-management.schema';
import { AuthUser } from 'modules/auth/auth-user.class';
import {
  CreateOrderResponseSwaggerDocs,
  CancelOrderResponseSwaggerDocs,
  UpdateOrderResponseSwaggerDocs,
  UpdateOrderStatusResponseSwaggerDocs,
  GetAllOrdersResponseSwaggerDocs,
} from './order-management-swagger.decorator';
import { SecureEndpoint } from 'guards';
import { FindOneParams } from 'common/dtos';
import { UpdateOrderManagementDto } from './dto/update-order-management.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ApiName } from 'decorators/openapi';
import { PaginatedResponse, SingleOrderResponse } from '@buzz/types';
import { SearchOrdersDto } from './dto/query-orders.dto';
import { Roles, User } from 'decorators/auth';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRoles } from 'modules/roles/constants';
import { CreateReturnDto } from './dto/create-return-product.dto';

@ApiName('Orders Management')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @CreateOrderResponseSwaggerDocs()
  @SecureEndpoint.apply()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @User() user: AuthUser,
  ): Promise<Order> {
    return this.orderService.createOrder(
      user.id,
      user.postcode,
      createOrderDto,
    );
  }

  @Patch(':id')
  @UpdateOrderResponseSwaggerDocs()
  @SecureEndpoint.apply()
  async update(
    @Param() params: FindOneParams.MongoId,
    @Body() updateOrderDto: UpdateOrderManagementDto,
  ): Promise<Order> {
    return this.orderService.updateOrder(params.id, updateOrderDto);
  }

  @Patch(':id/cancel')
  @CancelOrderResponseSwaggerDocs()
  @SecureEndpoint.apply()
  async cancel(@Param() params: FindOneParams.MongoId): Promise<void> {
    return this.orderService.cancelOrder(params.id);
  }

  @Patch(':id/status')
  @UpdateOrderStatusResponseSwaggerDocs()
  @SecureEndpoint.apply()
  async updateStatus(
    @Param() params: FindOneParams.MongoId,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.orderService.updateOrderStatus(
      params.id,
      updateOrderStatusDto.status,
    );
  }

  @Get(':id')
  @SecureEndpoint.apply()
  async getSingleOrder(@Param('id') id: string): Promise<SingleOrderResponse> {
    return this.orderService.getSingleOrder(id);
  }

  @Get()
  @SecureEndpoint.apply()
  @GetAllOrdersResponseSwaggerDocs()
  async getAllOrders(
    @Query() query: SearchOrdersDto,
  ): Promise<PaginatedResponse<Order>> {
    return this.orderService.getAllOrders(query);
  }

  @Get('management/volume')
  @ApiOperation({ summary: 'Get order volume by statuses' })
  @ApiResponse({
    status: 200,
    description: 'The volume of orders placed, fulfilled, and pending.',
  })
  @Roles(UserRoles.SALES_ASSISTANCE, UserRoles.ADMIN, UserRoles.SUPER_ADMIN)
  @SecureEndpoint.apply()
  async getOrderVolume(): Promise<{
    placed: number;
    fulfilled: number;
    pending: number;
  }> {
    return this.orderService.getOrderVolume();
  }

  @Get('fulfillment-time/average')
  @ApiOperation({ summary: 'Get average order fulfillment time' })
  @ApiResponse({
    status: 200,
    description: 'The average time taken to fulfill orders.',
  })
  @Roles(UserRoles.SALES_ASSISTANCE, UserRoles.ADMIN, UserRoles.SUPER_ADMIN)
  @SecureEndpoint.apply()
  async getAverageFulfillmentTime(): Promise<number> {
    return this.orderService.getAverageFulfillmentTime();
  }

  @Get('management/in-transit')
  @ApiOperation({ summary: 'Get orders currently in transit' })
  @ApiResponse({
    status: 200,
    description: 'List of orders currently in transit',
    isArray: true,
  })
  @Roles(UserRoles.SALES_ASSISTANCE, UserRoles.ADMIN, UserRoles.SUPER_ADMIN)
  @SecureEndpoint.apply()
  async getOrdersInTransit(): Promise<Order[]> {
    return this.orderService.getOrdersInTransit();
  }

  @Post('return')
  @ApiOperation({ summary: 'Return products from an order' })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated order with return details.',
  })
  @ApiResponse({ status: 404, description: 'Order or product not found' })
  @SecureEndpoint.apply()
  async createReturn(@Body() createReturnDto: CreateReturnDto): Promise<Order> {
    return this.orderService.createReturn(createReturnDto);
  }
}
