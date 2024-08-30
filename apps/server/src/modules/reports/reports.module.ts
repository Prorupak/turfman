import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { OrderManagementModule } from 'modules/order-management/order-management.module';
import { UsersModule } from 'modules/users/users.module';
import { MailModule } from 'core/mail/mail.module';

@Module({
  imports: [OrderManagementModule, UsersModule, MailModule],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
