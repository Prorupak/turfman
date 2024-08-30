import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service'; // Service where you use the model
import {
  DashboardMetrics,
  DashboardMetricsSchema,
} from './schema/dashboard-metrics.schema';
import { OrderManagementModule } from 'modules/delivery-configuration/order-management/order-management.module';
import { ProductModule } from 'modules/product/product.module';
import { DashboardController } from './dashboard.controller';

const mongoose = MongooseModule.forFeature([
  { name: DashboardMetrics.name, schema: DashboardMetricsSchema },
]);

@Module({
  imports: [mongoose, forwardRef(() => OrderManagementModule), ProductModule],
  providers: [DashboardService],
  exports: [DashboardService, mongoose],
  controllers: [DashboardController],
})
export class DashboardModule {}
