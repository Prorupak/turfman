import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  ValidateNested,
  IsMongoId,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReturnItemDto {
  @ApiProperty({
    description: 'The ID of the product being returned.',
    example: '605c78f7bcf86cd799439011',
  })
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'The quantity of the product being returned.',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    description: 'The reason for returning the product.',
    example: 'Damaged product',
  })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({
    description:
      'The attributes of the product variant being returned (e.g., size, color).',
    example: { size: 'small', color: 'red' },
    type: 'object',
  })
  @IsObject()
  @IsOptional()
  attributes?: Record<string, string>; // Define attributes as an object of key-value pairs
}

export class CreateReturnDto {
  @ApiProperty({
    description: 'The ID of the order from which products are being returned.',
    example: '66c777594aa571f347476767',
  })
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    description: 'List of products being returned.',
    type: [ReturnItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];
}
