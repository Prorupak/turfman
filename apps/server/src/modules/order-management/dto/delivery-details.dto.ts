import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DeliveryDetailsDto {
  @ApiProperty({
    description: 'The first line of the delivery address.',
    example: '123 Main St',
  })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiPropertyOptional({
    description: 'The second line of the delivery address (optional).',
    example: 'Apt 4B',
  })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({
    description: 'The city for the delivery address.',
    example: 'New York',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'The state or region for the delivery address.',
    example: 'NY',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'The postal or ZIP code for the delivery address.',
    example: '10001',
  })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({
    description: 'The country for the delivery address.',
    example: 'USA',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({
    description: 'The scheduled delivery date.',
    example: '2024-08-19T12:00:00Z',
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  deliveryDate?: Date;

  @ApiPropertyOptional({
    description: 'Special instructions for the delivery driver.',
    example: 'Leave the package at the back door.',
  })
  @IsString()
  @IsOptional()
  deliveryInstructions?: string;
}
