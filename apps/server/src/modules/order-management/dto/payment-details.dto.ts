import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class PaymentDetailsDto {
  @ApiProperty({
    description: 'Payment method used for the order.',
    example: 'Stripe',
  })
  @IsString()
  @IsNotEmpty()
  method: string;

  @ApiProperty({
    description: 'Total payment amount for the order.',
    example: 299.99,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Transaction ID from the payment gateway.',
    example: 'tx_123456789',
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiPropertyOptional({
    description: 'Date and time of payment.',
    example: '2024-06-13T10:45:00Z',
  })
  @IsOptional()
  @Type(() => Date)
  paymentDate?: Date;
}
