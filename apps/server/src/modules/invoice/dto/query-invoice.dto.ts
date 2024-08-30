import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationOffset } from 'common/dtos';
import { SORT_DIRECTION } from '@turfman/types';
import { InvoiceStatus } from '../schema/invoice.schema';

class DateRangeDto {
  @ApiPropertyOptional({
    description: 'Start date of the range.',
    example: '2023-01-01',
  })
  @IsDateString()
  @IsOptional()
  start?: string;

  @ApiPropertyOptional({
    description: 'End date of the range.',
    example: '2023-12-31',
  })
  @IsDateString()
  @IsOptional()
  end?: string;
}

export class InvoiceSortDto {
  @ApiPropertyOptional({
    description: 'The field by which to sort the invoices.',
    enum: ['createdAt', 'totalAmount', 'status', 'dueDate'], // Define sort fields
    example: 'createdAt',
  })
  @IsString()
  @IsOptional()
  field: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'The order in which to sort the invoices.',
    enum: Object.values(SORT_DIRECTION),
    example: SORT_DIRECTION.ASC,
  })
  @IsEnum(SORT_DIRECTION)
  @IsOptional()
  order: SORT_DIRECTION = SORT_DIRECTION.ASC;

  static initDefault() {
    const obj = new InvoiceSortDto();
    obj.field = 'createdAt';
    obj.order = SORT_DIRECTION.ASC;
    return obj;
  }
}

export class SearchInvoicesDto extends PaginationOffset {
  @ApiPropertyOptional({
    description: 'Filter invoices by status.',
    enum: InvoiceStatus,
    example: InvoiceStatus.UNPAID,
  })
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @ApiPropertyOptional({
    description: 'Filter invoices by customer email.',
    example: 'customer@example.com',
  })
  @IsString()
  @IsOptional()
  customerEmail?: string;

  @ApiPropertyOptional({
    description: 'Date range filter for created date.',
    type: 'object',
    example: { start: '2023-01-01', end: '2023-12-31' },
  })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @ApiPropertyOptional({
    description: 'Sorting criteria for the invoices.',
    type: InvoiceSortDto,
    default: InvoiceSortDto.initDefault(),
  })
  @ValidateNested()
  @Type(() => InvoiceSortDto)
  @IsOptional()
  sort: InvoiceSortDto = InvoiceSortDto.initDefault();
}
