import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeliveryConfigDto {
  @ApiProperty({
    description:
      'ID of the category for which this delivery configuration applies.',
    example: '60b8d295f1d2b32744bff4a3',
  })
  @IsMongoId()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({
    description: 'Flat rate for delivery for this category (if applicable).',
    example: 139,
  })
  @IsOptional()
  @IsNumber()
  flatRate?: number;

  @ApiPropertyOptional({
    description: 'Region-specific rates for delivery (if applicable).',
    example: { local: 25, national: 45 },
  })
  @IsOptional()
  @IsObject()
  regionSpecificRates?: Record<string, number>;

  @ApiPropertyOptional({
    description: 'Applicable postcodes for delivery for this category.',
    example: ['6000', '6001', '6002'],
  })
  @IsOptional()
  @IsArray()
  @Type(() => String)
  applicablePostcodes?: string[];

  @ApiPropertyOptional({
    description:
      'Flag indicating whether the delivery configuration is active.',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean = true;
}
