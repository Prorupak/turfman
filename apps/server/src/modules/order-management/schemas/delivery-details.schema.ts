import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Schema({ _id: false })
export class DeliveryDetails {
  @ApiProperty({
    description: 'The first line of the delivery address.',
    example: '123 Main St',
  })
  @Prop({ required: true })
  addressLine1: string;

  @ApiPropertyOptional({
    description: 'The second line of the delivery address (optional).',
    example: 'Apt 4B',
  })
  @Prop()
  addressLine2?: string;

  @ApiProperty({
    description: 'The city for the delivery address.',
    example: 'New York',
  })
  @Prop({ required: true })
  city: string;

  @ApiProperty({
    description: 'The state or region for the delivery address.',
    example: 'NY',
  })
  @Prop({ required: true })
  state: string;

  @ApiProperty({
    description: 'The postal or ZIP code for the delivery address.',
    example: '10001',
  })
  @Prop({ required: true })
  postalCode: string;

  @ApiProperty({
    description: 'The country for the delivery address.',
    example: 'USA',
  })
  @Prop({ required: true })
  country: string;

  @ApiPropertyOptional({
    description: 'The scheduled delivery date.',
    example: '2024-08-19T12:00:00Z',
    type: Date,
  })
  @Prop()
  deliveryDate?: Date;

  @ApiPropertyOptional({
    description: 'Special instructions for the delivery driver.',
    example: 'Leave the package at the back door.',
  })
  @Prop()
  deliveryInstructions?: string;
}
