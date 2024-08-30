import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';
import { OrderStatus } from '../order-management.enum';
import { OrderItem } from './order-item.schema';
import { User } from 'modules/users/schemas/users.schema';
import { DeliveryDetails } from './delivery-details.schema';
import { userSelect } from 'modules/users/constants';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { ReturnItem, ReturnItemSchema } from './return-items.schema';

export type OrderManagementDocument = HydratedDocument<Order>;

@Schema({
  collection: 'orders',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class Order {
  @ApiProperty({
    description: 'The ID of the customer placing the order.',
    type: String,
    example: '66c777594aa571f347476767',
  })
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    autopopulate: { select: userSelect },
  })
  customer: Types.ObjectId;

  @ApiProperty({
    description: 'The items included in the order.',
    type: [OrderItem],
  })
  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @ApiProperty({
    description: 'The current status of the order.',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({
    description: 'The total amount for the order.',
    example: 150.75,
  })
  @Prop({ required: true })
  totalAmount: number;

  @ApiProperty({
    description: 'The cost of delivery for the order.',
    example: 10.5,
  })
  @Prop({ required: true })
  deliveryCost: number;

  @ApiProperty({
    description: 'The delivery details for the order.',
    type: DeliveryDetails,
  })
  @Prop({ type: DeliveryDetails, required: true })
  deliveryDetails: DeliveryDetails;

  @ApiPropertyOptional({
    description: 'Any special instructions provided by the customer.',
    example: 'Leave the package at the back door.',
  })
  @Prop()
  specialInstructions?: string;

  @ApiPropertyOptional({
    description: 'Items returned in the order.',
    type: [ReturnItem],
  })
  @Prop({ type: [ReturnItemSchema], default: [] }) // Reference the updated schema
  returnItems: ReturnItem[];

  @ApiPropertyOptional({
    description: 'Indicates if an invoice has been generated for the order.',
    example: true,
    default: false,
  })
  @Prop({ default: false })
  invoiceGenerated: boolean;

  @ApiPropertyOptional({
    description: 'Indicates if the order has been paid.',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  isPaid: boolean;

  @ApiPropertyOptional({
    description: 'Indicates if the order was placed by a guest.',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  isGuestOrder: boolean;

  @ApiPropertyOptional({
    description: 'The email address provided by the guest for the order.',
    example: 'guest@example.com',
  })
  @Prop()
  guestEmail?: string;

  @ApiPropertyOptional({
    description: 'The reason provided for canceling the order.',
    example: 'Changed my mind',
  })
  @Prop()
  cancellationReason?: string;

  @ApiPropertyOptional({
    description: 'The scheduled delivery date for the order.',
    example: '2024-08-19T12:00:00Z',
    type: Date,
  })
  @Prop({ type: Date })
  scheduledDeliveryDate?: Date;

  @ApiPropertyOptional({
    description: 'Indicates if the order includes any returns.',
    example: true,
    default: false,
  })
  @Prop({ default: false })
  hasReturns: boolean;

  @ApiPropertyOptional({
    description: 'Creation date of order.',
    example: 'Thu Aug 22 2024 21:29:50 GMT+0545 (Nepal Time)',
    type: Date,
  })
  @Prop({ type: Date, default: Date.now() })
  createdAt?: Date;

  @ApiPropertyOptional({
    description: 'Updated date of order.',
    example: 'Thu Aug 22 2024 21:29:50 GMT+0545 (Nepal Time)',
    type: Date,
  })
  @Prop({ type: Date, default: Date.now() })
  updatedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.plugin(mongooseAutoPopulate);

OrderSchema.index({ customer: 1, status: 1, createdAt: 1 });
OrderSchema.index({ 'items.product': 1 });
OrderSchema.index({ scheduledDeliveryDate: 1 });
