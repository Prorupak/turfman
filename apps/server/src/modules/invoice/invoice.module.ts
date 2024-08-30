import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { OrderManagementModule } from 'modules/order-management/order-management.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from './schema/invoice.schema';
import { PdfGeneratorModule } from 'helpers/pdf/pdf-generator.module';
import { MailModule } from 'core/mail/mail.module';
import { PaginationModule } from 'helpers/pagination/pagination.module';

const mongoose = MongooseModule.forFeature([
  { name: Invoice.name, schema: InvoiceSchema },
]);

@Module({
  imports: [
    OrderManagementModule,
    mongoose,
    PdfGeneratorModule,
    MailModule,
    PaginationModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService, mongoose],
})
export class InvoiceModule {}
