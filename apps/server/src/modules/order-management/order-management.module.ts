import { forwardRef, Module } from '@nestjs/common';
import { OrderController } from './order-management.controller';
import { PaginationModule } from 'helpers/pagination/pagination.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order-management.schema';
import { CategoryModule } from 'modules/category/category.module';
import { ProductModule } from 'modules/product/product.module';
import { DeliveryConfigurationModule } from 'modules/delivery-configuration/delivery-configuration.module';
import { OrderService } from './order-management.service';
import { User, UserSchema } from 'modules/users/schemas/users.schema';
import { DashboardModule } from 'modules/dashboard/dashboard.module';

const mongoose = MongooseModule.forFeature([
  { name: Order.name, schema: OrderSchema },
  { name: User.name, schema: UserSchema },
]);

@Module({
  imports: [
    PaginationModule,
    CategoryModule,
    ProductModule,
    DeliveryConfigurationModule,
    forwardRef(() => DashboardModule),
    mongoose,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService, mongoose],
})
export class OrderManagementModule {}
