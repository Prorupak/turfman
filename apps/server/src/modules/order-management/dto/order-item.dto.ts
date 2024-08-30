import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsObject,
} from 'class-validator';
import { Types } from 'mongoose';

export class OrderItemDto {
  @ApiProperty({
    description: 'ID of the product being ordered.',
    example: '60b8d295f1d2b32744bff4a3',
  })
  @IsMongoId()
  @IsNotEmpty()
  product: string | Types.ObjectId;

  @ApiProperty({
    description: 'Quantity of the product being ordered.',
    example: 2,
  })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @ApiPropertyOptional({
    description: 'Variant attributes for the product (e.g., size, color).',
    example: { size: 'Medium', color: 'Green' },
  })
  @IsOptional()
  @IsObject()
  variantAttributes?: Record<string, string>;
}
