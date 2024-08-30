import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Invoice,
  InvoiceDocument,
  InvoiceStatus,
} from './schema/invoice.schema';
import { OrderService } from 'modules/order-management/order-management.service';
import { PdfGeneratorService } from 'helpers/pdf/pdf-generator.service';
import { MailService } from 'core/mail/mail.service';
import { Order, Product } from '@buzz/types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  PaginationService,
  PopulateField,
} from 'helpers/pagination/pagination.service';
import { REDIS_TTL } from 'constants/global';
import { SearchInvoicesDto } from './dto/query-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { invoiceSelect } from './constants';
import { orderSelectBase } from 'modules/order-management/constants';
import { userSelect } from 'modules/users/constants';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly orderService: OrderService,
    private readonly mailService: MailService,
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly paginationService: PaginationService,
  ) {}

  async generateInvoice(orderId: string): Promise<Invoice> {
    const order = await this.orderService.getSingleOrder(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID '${orderId}' not found.`);
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.random()
      .toString()
      .slice(2, 8)}`;

    const invoice = new this.invoiceModel({
      orderId: order.id,
      invoiceNumber,
      customerEmail: order.customer.email,
      totalAmount: order.totalAmount,
      status: InvoiceStatus.UNPAID,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    });

    await invoice.save();

    console.log({ invoice, order: JSON.stringify(order.items) });

    // Generate PDF and send invoice email
    const pdfContent = await this.pdfGeneratorService.generateInvoicePdf(
      invoice,
      order,
    );

    await this.sendInvoiceEmail(
      invoice,
      order,
      order.customer.email,
      pdfContent,
    );

    return invoice;
  }

  async sendInvoiceEmail(
    invoice: Invoice,
    order: Order,
    recipientEmail: string,
    pdfContent: Buffer,
  ) {
    // Prepare data for the HBS template
    const emailContent = await this.mailService.renderTemplate('invoice', {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: new Date().toLocaleDateString(),
      dueDate: invoice.dueDate.toLocaleDateString(),
      invoiceStatus: invoice.status,
      customerName: order.customer.displayName,
      customerEmail: invoice.customerEmail,
      totalAmount: invoice.totalAmount.toFixed(2),
      items: order.items.map((item) => {
        const product = item.product as Product;
        const selectedVariantDetail = product?.variantDetails?.find(
          (variant) => {
            // Match the variant based on item's attributes
            return Object.entries(item.variantAttributes).every(
              ([key, value]) => variant.attributes[key] === value,
            );
          },
        );

        if (!selectedVariantDetail) {
          throw new Error(`Variant not found for product ID ${product.id}`);
        }

        return {
          productName: product.name,
          sku: product.sku,
          quantity: item.quantity,
          unitPrice: selectedVariantDetail.price,
          total: (selectedVariantDetail.price * item.quantity).toFixed(2),
        };
      }),
      taxRate: '10', // Assuming a static tax rate; this can be dynamic
      taxAmount: (order.totalAmount * 0.1).toFixed(2), // Calculated tax amount
      grandTotal: (order.totalAmount * 1.1).toFixed(2), // Including tax
      companyName: 'Your Company Name',
      companyLogoUrl:
        'https://res.cloudinary.com/dub6nqya5/image/upload/f_png/guvcgt7xpwwy1drm0eqt.jpg',
      companyAddress: '123 Main St, City, Country',
      companyEmail: 'info@yourcompany.com',
      companyPhone: '+1234567890',
    });

    await this.mailService.send(
      {
        to: recipientEmail,
        from: this.mailService.sender,
        subject: `Invoice ${invoice.invoiceNumber}`,
        html: emailContent,
        attachments: [
          {
            content: pdfContent.toString('base64'),
            filename: `${invoice.invoiceNumber}.pdf`,
            type: 'application/pdf',
            disposition: 'attachment',
          },
        ],
      },
      false,
    );
  }

  async getInvoiceById(id: string): Promise<any> {
    const cacheKey = `invoice:${id}`;

    return this.cacheManager.wrap(
      cacheKey,
      async () => {
        const invoice = await this.invoiceModel
          .findById(id)
          .select(invoiceSelect)
          .populate({
            path: 'orderId',
            select: orderSelectBase,
            populate: {
              path: 'customer',
              model: 'User',
              select: userSelect,
            },
          })
          .lean()
          .exec();
        if (!invoice) {
          throw new NotFoundException(`Invoice with ID '${id}' not found.`);
        }

        let order = {};

        order = invoice.orderId;
        delete invoice.orderId;
        delete (invoice as any).order;
        return {
          order,
          ...invoice,
        };
      },
      5 * 60 * 60,
    );
  }

  async findAll(queryOptions: SearchInvoicesDto) {
    const { skip, take, sort } = queryOptions;
    const pagination = { page: skip, perPage: take };
    const matchFilter: any = {};

    if (queryOptions.status) {
      matchFilter.status = queryOptions.status;
    }

    if (queryOptions.dateRange) {
      matchFilter.createdAt = {
        $gte: new Date(queryOptions.dateRange.start),
        $lte: new Date(queryOptions.dateRange.end),
      };
    }

    const populateField: PopulateField[] = [
      {
        from: 'orders',
        localField: 'orderId',
        project: orderSelectBase,
        unwind: true,
      },
      {
        from: 'users',
        localField: 'orderId.customer',
        project: userSelect,
        unwind: true,
      },
    ];

    const cacheKey = `invoices:${JSON.stringify(queryOptions)}`;

    return this.cacheManager.wrap(
      cacheKey,
      () =>
        this.paginationService.getPaginatedQueryResponse(
          this.invoiceModel,
          matchFilter,
          pagination,
          populateField,
          invoiceSelect,
          { [sort.field]: sort.order },
        ),
      REDIS_TTL,
    );
  }

  async update(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    const updatedInvoice = await this.invoiceModel
      .findByIdAndUpdate(id, updateInvoiceDto, { new: true })
      .exec();

    if (!updatedInvoice) {
      throw new NotFoundException(`Invoice with ID '${id}' not found.`);
    }

    return updatedInvoice;
  }

  async delete(id: string): Promise<void> {
    const deletedInvoice = await this.invoiceModel.findByIdAndDelete(id).exec();
    if (!deletedInvoice) {
      throw new NotFoundException(`Invoice with ID '${id}' not found.`);
    }
  }

  async resendInvoiceEmail(id: string): Promise<void> {
    const invoice = await this.invoiceModel.findById(id).exec();
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID '${id}' not found.`);
    }

    const order = await this.orderService.getSingleOrder(
      invoice.orderId.toString(),
    );
    if (!order) {
      throw new NotFoundException(
        `Order with ID '${invoice.orderId}' not found.`,
      );
    }

    const pdfContent = await this.pdfGeneratorService.generateInvoicePdf(
      invoice,
      order,
    );
    await this.sendInvoiceEmail(
      invoice,
      order,
      order.customer.email,
      pdfContent,
    );
  }
}
