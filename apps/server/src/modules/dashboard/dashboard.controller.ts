import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'decorators/auth';
import { ApiName } from 'decorators/openapi';
import { SecureEndpoint } from 'guards';
import { OrderService } from 'modules/delivery-configuration/order-management/order-management.service';
import { UserRoles } from 'modules/roles/constants';
import { Periods } from '@buzz/types';
import { PaginationOffset } from 'common/dtos';
import { SearchOrdersDto } from 'modules/delivery-configuration/order-management/dto/query-orders.dto';
import { DashboardService } from './dashboard.service';

/**
 * Controller for managing dashboard-related data and analytics.
 * @module DashboardController
 */
@Roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN)
@SecureEndpoint.apply()
@ApiName('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly orderService: OrderService,
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('sales-statistics')
  @ApiOperation({ summary: 'Get total sales statistics by time period' })
  @ApiResponse({
    status: 200,
    description: 'Returns sales statistics grouped by a specified time period.',
  })
  async getTotalSalesStatistics(
    @Query('period')
    period: Periods,
  ): Promise<any> {
    return this.orderService.getTotalSalesStatistics(period);
  }

  @Get('best-selling-products')
  @ApiOperation({ summary: 'Get best-selling products' })
  @ApiResponse({
    status: 200,
    description:
      'Returns a list of best-selling products by units sold and revenue.',
  })
  async getBestSellingProducts(
    @Query() pagination: PaginationOffset,
  ): Promise<any> {
    return this.orderService.getBestSellingProducts(pagination.take || 5);
  }

  @Get('product-sales-data')
  @ApiOperation({ summary: 'Get sales data for all products' })
  @ApiResponse({
    status: 200,
    description:
      'Returns sales data for all products including units sold and revenue.',
  })
  async getProductSalesData(
    @Query() pagination: SearchOrdersDto,
  ): Promise<any> {
    return this.orderService.getProductSalesData(pagination);
  }

  @Get('product-returns-data')
  @ApiOperation({ summary: 'Get product return data' })
  @ApiResponse({
    status: 200,
    description: 'Returns product return rates and reasons for each product.',
  })
  async getProductReturnsData(): Promise<any> {
    return this.orderService.getProductReturnsData();
  }

  @Get('returns')
  @ApiOperation({
    summary: 'Get product return metrics',
    description:
      'Fetches metrics related to product returns, including return rates, reasons for returns, and revenue impact.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return metrics fetched successfully.',
  })
  async getReturnMetrics() {
    return this.dashboardService.getReturnMetrics();
  }
}
