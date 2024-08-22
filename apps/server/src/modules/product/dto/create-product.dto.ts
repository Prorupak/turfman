import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
  IsMongoId,
  ArrayMinSize,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class VariantDto {
  @ApiProperty({
    description: 'The variant name (e.g., size, color).',
    example: 'size',
  })
  @IsString()
  @IsNotEmpty()
  variantName: string;

  @ApiProperty({
    description:
      'The available options for this variant (e.g., small, medium, large).',
    example: ['small', 'medium', 'large'],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  variantOptions: string[];
}

class VariantDetailDto {
  @ApiProperty({
    description: 'The price for this specific variant combination.',
    example: 19.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'The quantity available for this variant combination.',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({
    description: 'Attributes for the variant (e.g., size: small, color: red).',
    example: { size: 'small', color: 'red' },
  })
  @IsObject()
  attributes: Record<string, string>; // Dynamic attributes map for the variant combination
}

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product.',
    example: 'Wireless Headphones',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The unique Stock Keeping Unit (SKU) for the product.',
    example: 'WH-123456',
  })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiPropertyOptional({
    description: 'A brief description of the product.',
    example: 'High-quality wireless headphones with noise cancellation.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The base price of the product (if no variants).',
    example: 99.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description:
      'The unit of measurement for the product (e.g., pcs, kg, sqm).',
    example: 'pcs',
    default: 'pcs',
  })
  @IsString()
  @IsOptional()
  unit: string = 'pcs';

  @ApiProperty({
    description: 'The ID of the category the product belongs to.',
    example: '60b8d295f1d2b32744bff4a3',
  })
  @IsMongoId()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({
    description: 'The product variants (e.g., size, color).',
    type: [VariantDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  @IsOptional()
  variants?: VariantDto[];

  @ApiPropertyOptional({
    description: 'Details for each variant combination.',
    type: [VariantDetailDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDetailDto)
  @IsOptional()
  variantDetails?: VariantDetailDto[];

  @ApiPropertyOptional({
    description:
      'The quantity of the product available in stock (if no variants).',
    example: 100,
    default: 0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stockQuantity: number = 0;

  @ApiPropertyOptional({
    description: 'Indicates if the product is active or available for sale.',
    example: true,
    default: true,
  })
  @IsOptional()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    description: 'An array of related product IDs.',
    example: ['605c78f7bcf86cd799439012', '605c78f7bcf86cd799439013'],
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  relatedProducts?: string[];

  @ApiPropertyOptional({
    description: 'SEO metadata for the product.',
    example: {
      title: 'Wireless Headphones',
      description: 'Buy the best wireless headphones',
    },
  })
  @IsObject()
  @IsOptional()
  meta?: Record<string, string>; // SEO-related metadata

  @ApiPropertyOptional({
    description: 'Dynamic pricing based on location (e.g., regional pricing).',
    example: { 'New York': 99.99, 'Los Angeles': 89.99 },
  })
  @IsObject()
  @IsOptional()
  pricingByLocation?: Record<string, number>;

  @ApiPropertyOptional({
    description: 'The date when the product will be available for purchase.',
    example: '2023-12-01',
  })
  @IsOptional()
  availableFrom?: Date;

  @ApiPropertyOptional({
    description:
      'The date when the product will no longer be available for purchase.',
    example: '2024-12-01',
  })
  @IsOptional()
  availableUntil?: Date;

  @ApiPropertyOptional({
    description: 'Indicates if the product is archived (soft deletion).',
    example: false,
  })
  @IsOptional()
  isArchived?: boolean = false;
}
