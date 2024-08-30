import { SORT_DIRECTION } from '@turfman/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { PaginationOffset } from 'common/dtos';
import _ from 'lodash';

export const ProductSortFields = {
  name: 'name',
  price: 'price',
  stock: 'stock',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export type ProductSortFields =
  (typeof ProductSortFields)[keyof typeof ProductSortFields];

export class ProductSortDto {
  @ApiProperty({
    description: 'The field by which to sort the products.',
    enum: ProductSortFields,
    example: 'price',
  })
  @IsIn(_.values(ProductSortFields))
  @IsString()
  @IsNotEmpty()
  field: ProductSortFields;

  @ApiProperty({
    description: 'The order in which to sort the products.',
    enum: Object.values(SORT_DIRECTION),
    example: SORT_DIRECTION.ASC,
  })
  @IsIn(Object.values(SORT_DIRECTION))
  @IsNumber()
  @IsNotEmpty()
  order: SORT_DIRECTION.ASC | SORT_DIRECTION.DESC;

  static initDefault() {
    const obj = new ProductSortDto();
    obj.field = ProductSortFields.createdAt;
    obj.order = SORT_DIRECTION.ASC;
    return obj;
  }
}

export class SearchProductsDto extends PaginationOffset {
  @ApiPropertyOptional({
    description: 'Search by product name or SKU.',
    example: 'Wireless Headphones',
    maxLength: 255,
  })
  @MaxLength(255)
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by category ID.',
    example: '60b8d295f1d2b32744bff4a3',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter products within a specific price range.',
    example: { min: 50, max: 200 },
    type: Object,
  })
  @IsObject()
  @IsOptional()
  priceRange?: {
    min: number;
    max: number;
  };

  @ApiPropertyOptional({
    description: 'Filter by stock availability (e.g., in stock, out of stock).',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by product activity status (e.g., active, archived).',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description:
      'Filter by variant attributes (e.g., size: small, color: red).',
    example: { size: 'small', color: 'red' },
  })
  @IsObject()
  @IsOptional()
  variantAttributes?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Specify the sorting criteria.',
    type: ProductSortDto,
    default: ProductSortDto.initDefault(),
  })
  @ValidateNested()
  @IsObject()
  @IsOptional()
  @Type(() => ProductSortDto)
  @Transform(({ value }) => (value ? value : ProductSortDto.initDefault()))
  sort: ProductSortDto = ProductSortDto.initDefault();
}
