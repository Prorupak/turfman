import { Order, Product } from '@turfman/types';
import { Injectable } from '@nestjs/common';
import { Invoice } from 'modules/invoice/schema/invoice.schema';
import { PDFDocument, rgb } from 'pdf-lib';
// import * as QRCode from 'qrcode';

@Injectable()
export class PdfGeneratorService {
  constructor() {}

  /**
   * Generates an invoice PDF using pdf-lib.
   * @param invoice - The invoice data to include in the PDF.
   * @param order - The associated order data.
   * @returns Promise<Buffer> - The generated PDF as a buffer.
   */
  async generateInvoicePdf(invoice: Invoice, order: Order): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);

      // Add company logo
      const logoUrl =
        'https://res.cloudinary.com/dub6nqya5/image/upload/f_png/guvcgt7xpwwy1drm0eqt.jpg'; // Replace with your logo URL
      const logoBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
      const logoImage = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logoImage, {
        x: 50,
        y: 720,
        width: 100,
        height: 50,
      });

      // Add invoice title and details
      page.drawText('INVOICE', {
        x: 50,
        y: 700,
        size: 20,
        color: rgb(0, 0, 0),
      });
      page.drawText(`Invoice Number: ${invoice.invoiceNumber}`, {
        x: 50,
        y: 680,
        size: 12,
      });
      page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: 660,
        size: 12,
      });

      // Customer details
      page.drawText(`Customer: ${order.customer.displayName}`, {
        x: 50,
        y: 640,
        size: 12,
      });
      page.drawText(`Email: ${invoice.customerEmail}`, {
        x: 50,
        y: 620,
        size: 12,
      });

      // Add order items
      let currentY = 600;
      order.items.forEach((item, index) => {
        const { product, quantity } = item;
        page.drawText(
          `${index + 1}. ${(product as Product).name} x${quantity}`,
          {
            x: 50,
            y: currentY,
            size: 12,
          },
        );
        currentY -= 20;
      });

      // // Add QR code for payment
      // const qrCodeData = await QRCode.toDataURL(
      //   `https://example.com/pay/${invoice.invoiceNumber}`,
      // );
      // const qrCodeBytes = await fetch(qrCodeData).then((res) =>
      //   res.arrayBuffer(),
      // );
      // const qrCodeImage = await pdfDoc.embedPng(qrCodeBytes);
      // page.drawImage(qrCodeImage, {
      //   x: 400,
      //   y: 600,
      //   width: 100,
      //   height: 100,
      // });

      // Add total amount
      page.drawText(`Total Amount: $${invoice.totalAmount.toFixed(2)}`, {
        x: 50,
        y: currentY - 20,
        size: 12,
        color: rgb(0.2, 0.8, 0.2),
      });

      // Finalize PDF
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.log({ error });
    }
  }
}
