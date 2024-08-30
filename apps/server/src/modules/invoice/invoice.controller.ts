import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { SecureEndpoint } from 'guards';
import { AppError } from 'common/errors';
import { SearchInvoicesDto } from './dto/query-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
// import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post(':orderId')
  @ApiOperation({ summary: 'Generate a new invoice for an order' })
  @ApiResponse({
    status: 201,
    description: 'The invoice has been successfully created.',
  })
  @SecureEndpoint.apply()
  async generate(@Param('orderId') orderId: string) {
    return this.invoiceService.generateInvoice(orderId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single invoice by its ID' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  @SecureEndpoint.apply()
  async getInvoice(@Param('id') id: string) {
    const invoice = await this.invoiceService.getInvoiceById(id);
    if (!invoice) {
      throw new AppError.NotFound(`Invoice with ID '${id}' not found.`);
    }
    return invoice;
  }

  @Get()
  @ApiOperation({
    summary: 'Get all invoices with filtering, sorting, and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'List of invoices retrieved successfully.',
  })
  @SecureEndpoint.apply()
  async findAll(@Query() query: SearchInvoicesDto) {
    return this.invoiceService.findAll(query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing invoice' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully.' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoiceService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  @SecureEndpoint.apply()
  async delete(@Param('id') id: string) {
    return this.invoiceService.delete(id);
  }

  @Post(':id/resend')
  @ApiOperation({ summary: 'Resend invoice email' })
  @ApiResponse({
    status: 200,
    description: 'Invoice email resent successfully.',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  @SecureEndpoint.apply()
  async resendEmail(@Param('id') id: string) {
    return this.invoiceService.resendInvoiceEmail(id);
  }
}
