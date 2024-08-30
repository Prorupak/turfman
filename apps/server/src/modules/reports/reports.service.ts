import { Periods } from '@turfman/types';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from 'core/mail/mail.service';
import { OrderService } from 'modules/order-management/order-management.service';
import { UsersService } from 'modules/users/users.service';

@Injectable()
export class ReportsService {
  private logger = new Logger(ReportsService.name);
  constructor(
    private orderService: OrderService,
    private mailService: MailService,
    private userService: UsersService,
  ) {}

  @Cron(CronExpression.EVERY_WEEKEND)
  async sendWeeklyReport() {
    const reportData = {
      salesStatistics: await this.orderService.getTotalSalesStatistics(
        Periods.WEEKLY,
      ),
      bestSellingProducts: await this.orderService.getBestSellingProducts(5),
      returnsData: await this.orderService.getProductReturnsData(),
    };

    console.log(reportData.returnsData);

    const adminEmails = await this.userService.getAdminEmails();

    const emailContent = await this.mailService.renderTemplate(
      'weekly-reports',
      reportData,
    );

    if (adminEmails.length) {
      const mailOptions = {
        to: adminEmails,
        from: this.mailService.sender,
        subject: 'Weekly Sales Report',
        html: emailContent,
      };

      const mail = await this.mailService.send(mailOptions);

      if (mail[0]?.statusCode === 202)
        this.logger.log(
          `Weekly reports has been sent to respected admins and super_admins: [${adminEmails.join(' ')}]`,
        );
    }
  }
}
