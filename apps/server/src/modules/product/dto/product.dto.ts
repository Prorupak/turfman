import { ApiProperty } from '@nestjs/swagger';
import { CategoryDto } from './category-product.dto';

export class VariantDto {
  @ApiProperty({
    description: 'The name of the variant, such as size or color.',
    example: 'size',
  })
  variantName: string;

  @ApiProperty({
    description: 'The available options for this variant.',
    example: ['small', 'large', 'medium'],
    type: [String],
  })
  variantOptions: string[];
}

export class VariantDetailDto {
  @ApiProperty({
    description: 'The price of the variant.',
    example: 500,
  })
  price: number;

  @ApiProperty({
    description: 'The available quantity for this variant.',
    example: 10,
  })
  quantity: number;

  @ApiProperty({
    description: 'Attributes of the variant, such as size and color.',
    example: { size: 'small', color: 'red' },
    type: 'object',
  })
  attributes: Record<string, string>;
}

export class ProductDto {
  @ApiProperty({
    description: 'The name of the product.',
    example: 'bags',
  })
  name: string;

  @ApiProperty({
    description: 'The unique Stock Keeping Unit (SKU) for the product.',
    example: 'BG-3423',
  })
  sku: string;

  @ApiProperty({
    description: 'The SEO-friendly URL slug for the product.',
    example: 'bags',
  })
  slug: string;

  @ApiProperty({
    description: 'The category the product belongs to.',
    type: CategoryDto,
  })
  category: CategoryDto;

  @ApiProperty({
    description: 'A brief description of the product.',
    example: 'High-quality garden tools and supplies.',
  })
  description: string;

  @ApiProperty({
    description: 'Product variants such as size, color, etc.',
    type: [VariantDto],
  })
  variants: VariantDto[];

  @ApiProperty({
    description: 'Pricing and inventory details per variant.',
    type: [VariantDetailDto],
  })
  variantDetails: VariantDetailDto[];

  @ApiProperty({
    description: 'The total available stock for this product.',
    example: 10,
  })
  stock: number;

  @ApiProperty({
    description:
      'Indicates whether the product is active or available for sale.',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Indicates whether the product is archived.',
    example: false,
  })
  isArchived: boolean;

  @ApiProperty({
    description: 'The unique identifier for the product.',
    example: '66c777594aa571f347476767',
  })
  id: string;
}
