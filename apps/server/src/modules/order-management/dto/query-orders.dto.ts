import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsMongoId,
  IsInt,
  Min,
  ValidateNested,
  IsDateString,
  IsNotEmpty,
  IsIn,
  IsNumber,
} from 'class-validator';
import { PaginationOffset } from 'common/dtos'; // Replace with the correct path
import { OrderStatus } from '../order-management.enum'; // Adjust the import path as needed
import { ProductSortFields } from 'modules/product/dto/query-products';
import { SORT_DIRECTION } from '@buzz/types';

/**
 * Data Transfer Object for specifying date range filters.
 */
export class DateRangeDto {
  @ApiPropertyOptional({
    description: 'The start date for the range filter.',
    example: '2023-01-01',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'The end date for the range filter.',
    example: '2023-12-31',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}

/**
 * Data Transfer Object for sorting options in the order query.
 */
export class OrderSortDto {
  @ApiProperty({
    description: 'The field by which to sort the orders.',
    enum: ['createdAt', 'totalAmount', 'status'],
    example: 'createdAt',
  })
  @IsIn(['createdAt', 'totalAmount', 'status'])
  @IsString()
  @IsNotEmpty()
  field: string;

  @ApiProperty({
    description: 'The order direction (asc or desc).',
    enum: Object.values(SORT_DIRECTION),
    example: SORT_DIRECTION.ASC,
  })
  @IsIn(Object.values(SORT_DIRECTION))
  @IsNumber()
  @IsNotEmpty()
  order: SORT_DIRECTION.ASC | SORT_DIRECTION.DESC;

  static initDefault() {
    const obj = new OrderSortDto();
    obj.field = ProductSortFields.createdAt;
    obj.order = SORT_DIRECTION.ASC;
    return obj;
  }
}

/**
 * Data Transfer Object for searching and filtering orders with pagination.
 */
export class SearchOrdersDto extends PaginationOffset {
  @ApiPropertyOptional({
    description: 'The status of the orders to filter.',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'The ID of the user who placed the orders.',
    example: '60b8d295f1d2b32744bff4a3',
  })
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Search keyword to perform full-text search on order data.',
    example: 'electronics',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sorting options for orders.',
    type: OrderSortDto,
    default: OrderSortDto.initDefault(),
  })
  @ValidateNested()
  @Type(() => OrderSortDto)
  @IsOptional()
  @Transform(({ value }) => (value ? value : OrderSortDto.initDefault()))
  sort: OrderSortDto = OrderSortDto.initDefault();

  @ApiPropertyOptional({
    description: 'Pagination: number of records to return.',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Date range for filtering orders by creation date.',
    type: DateRangeDto,
    example: { from: '2023-01-01', to: '2023-12-31' },
  })
  @ValidateNested()
  @Type(() => DateRangeDto)
  @IsOptional()
  dateRange?: DateRangeDto;
}
