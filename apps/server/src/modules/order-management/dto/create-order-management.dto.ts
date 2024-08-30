import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { OrderItemDto } from './order-item.dto';
import { DeliveryDetailsDto } from './delivery-details.dto';
// import { DeliveryDetailsDto } from './delivery-details.dto';
// import { PaymentDetailsDto } from './payment-details.dto';

// export class CreateOrderManagementDto {
//   @ApiProperty({
//     description: 'Array of items being ordered.',
//     type: [OrderItemDto],
//   })
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => OrderItemDto)
//   items: OrderItemDto[];

//   @ApiProperty({
//     description: 'Delivery details for the order.',
//     type: DeliveryDetailsDto,
//   })
//   @ValidateNested()
//   @Type(() => DeliveryDetailsDto)
//   deliveryDetails: DeliveryDetailsDto;

//   @ApiProperty({
//     description: 'Payment details for the order.',
//     type: PaymentDetailsDto,
//   })
//   @ValidateNested()
//   @Type(() => PaymentDetailsDto)
//   paymentDetails: PaymentDetailsDto;

//   @ApiPropertyOptional({
//     description: 'Special instructions for the order.',
//     example: 'Handle with care, fragile items.',
//   })
//   @IsString()
//   @IsOptional()
//   specialInstructions?: string;

//   @ApiProperty({
//     description: 'Total amount for the order.',
//     example: 399.99,
//   })
//   @IsNumber()
//   @Min(0)
//   @IsNotEmpty()
//   totalAmount: number;

//   @ApiProperty({
//     description: 'Delivery cost for the order.',
//     example: 49.99,
//   })
//   @IsNumber()
//   @Min(0)
//   @IsNotEmpty()
//   deliveryCost: number;

//   @ApiPropertyOptional({
//     description: 'Indicates if this is a guest checkout order.',
//     example: false,
//   })
//   @IsOptional()
//   @IsBoolean()
//   isGuestOrder?: boolean = false;

//   @ApiPropertyOptional({
//     description: 'Guest email (if this is a guest order).',
//     example: 'guest@example.com',
//   })
//   @IsString()
//   @IsOptional()
//   guestEmail?: string;

//   @ApiPropertyOptional({
//     description: 'Scheduled delivery date for the order.',
//     example: '2024-06-15',
//   })
//   @IsOptional()
//   @Type(() => Date)
//   scheduledDeliveryDate?: Date;
// }
export class CreateOrderDto {
  @ApiProperty({
    description: 'Array of order items including product IDs and quantities.',
    type: [OrderItemDto],
  })
  @ValidateNested({ each: true })
  @IsArray()
  @IsNotEmpty()
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    description: 'Delivery details for the order.',
    type: DeliveryDetailsDto,
  })
  @ValidateNested()
  @Type(() => DeliveryDetailsDto)
  @IsNotEmpty()
  deliveryDetails: DeliveryDetailsDto;

  @ApiPropertyOptional({
    description: 'Special instructions or notes for the order.',
    example: 'Please leave the package at the front door.',
  })
  @IsString()
  @IsOptional()
  specialInstructions?: string;
}
