import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from 'modules/order-management/schemas/order-management.schema';

export type InvoiceDocument = HydratedDocument<Invoice>;

export enum InvoiceStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PENDING = 'PENDING',
  PAID = 'PAID',
}

@Schema({
  collection: 'invoices',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class Invoice {
  @ApiProperty({
    description: 'Associated order ID.',
    example: '66c777594aa571f347476767',
  })
  @Prop({ type: Types.ObjectId, ref: Order.name, required: true })
  orderId: Types.ObjectId;

  @ApiProperty({
    description: 'Invoice number.',
    example: 'INV-2024-0001',
  })
  @Prop({ required: true, unique: true })
  invoiceNumber: string;

  @ApiProperty({
    description: 'Customer email.',
    example: 'customer@example.com',
  })
  @Prop({ required: true })
  customerEmail: string;

  @ApiProperty({
    description: 'Total amount of the invoice.',
    example: 150.75,
  })
  @Prop({ required: true })
  totalAmount: number;

  @ApiProperty({
    description: 'Payment status of the invoice.',
    enum: InvoiceStatus,
    example: InvoiceStatus.UNPAID,
  })
  @Prop({ required: true, enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status: InvoiceStatus;

  @ApiProperty({
    description: 'Due date for payment.',
    example: '2024-09-30T00:00:00Z',
  })
  @Prop({ type: Date, required: true })
  dueDate: Date;

  @ApiProperty({
    description: 'Payment details (method, transaction ID, etc.).',
    example: { method: 'Credit Card', transactionId: 'XYZ123' },
    type: 'object',
  })
  @Prop({ type: Map, of: String })
  paymentDetails: Map<string, string>;

  @ApiProperty({
    description: 'Creation date of the invoice.',
    example: 'Thu Aug 22 2024 21:29:50 GMT+0545 (Nepal Time)',
    type: Date,
  })
  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @ApiProperty({
    description: 'Updated date of the invoice.',
    example: 'Thu Aug 22 2024 21:29:50 GMT+0545 (Nepal Time)',
    type: Date,
  })
  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.index({ createdAt: -1 });
InvoiceSchema.index({ updatedAt: -1 });
InvoiceSchema.index({ orderId: 1 });
InvoiceSchema.index({ customerEmail: 1 });
