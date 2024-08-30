import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { InvoiceStatus } from '../schema/invoice.schema';

export class UpdateInvoiceDto {
  @ApiPropertyOptional({
    description: 'The status of the invoice.',
    enum: InvoiceStatus,
    example: InvoiceStatus.PAID,
  })
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @ApiPropertyOptional({
    description: 'The total amount of the invoice.',
    example: 200.5,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAmount?: number;

  @ApiPropertyOptional({
    description: 'The due date for the invoice payment.',
    example: '2024-12-31',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Any additional notes or comments for the invoice.',
    example: 'Please pay by the due date.',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
