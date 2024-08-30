import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { VerificationTokensModule } from './verification-tokens/verification-tokens.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { OrderManagementModule } from './order-management/order-management.module';
import { DeliveryConfigurationModule } from './delivery-configuration/delivery-configuration.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AlertsModule } from './alerts/alerts.module';
import { ReportsModule } from './reports/reports.module';
import { InvoiceModule } from './invoice/invoice.module';

const MAIN_APP_MODULES = [
  UsersModule,
  RolesModule,
  AuthModule,
  VerificationTokensModule,
  CategoryModule,
  ProductModule,
  OrderManagementModule,
  DeliveryConfigurationModule,
  DashboardModule,
  AlertsModule,
  ReportsModule,
  InvoiceModule,
];

@Module({
  imports: MAIN_APP_MODULES,
  exports: MAIN_APP_MODULES,
})
export class MainAppModule {}
