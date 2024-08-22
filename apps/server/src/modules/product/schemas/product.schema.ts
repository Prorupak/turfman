import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { generateSlug } from 'utils';

export type ProductDocument = HydratedDocument<Product>;

class VariantOption {
  @Prop({ type: String, required: true })
  variantName: string;

  @Prop({ type: [String], required: true })
  variantOptions: string[];
}

@Schema({ timestamps: true })
export class Product {
  @ApiProperty({
    description: 'The name of the product.',
    example: 'Wireless Headphones',
  })
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @ApiProperty({
    description: 'The unique Stock Keeping Unit (SKU) for the product.',
    example: 'WH-123456',
  })
  @Prop({ required: true, unique: true, trim: true })
  sku: string;

  @ApiProperty({
    description: 'SEO-friendly URL slug generated from the product name.',
    example: 'wireless-headphones',
  })
  @Prop({
    required: true,
    unique: true,
    trim: true,
    default: function () {
      return generateSlug(this.name);
    },
  })
  slug: string;

  @ApiProperty({
    description: 'The category ID this product belongs to.',
    example: '605c78f7bcf86cd799439011',
    type: String,
  })
  @Prop({ required: true, type: Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'An array of sub-category IDs this product belongs to.',
    example: ['605c78f7bcf86cd799439012', '605c78f7bcf86cd799439013'],
    type: [String],
  })
  @Prop({ type: [Types.ObjectId], ref: 'Category' })
  subCategories: Types.ObjectId[];

  @ApiPropertyOptional({
    description: 'Dynamic metadata for SEO tags.',
    example: {
      title: 'Wireless Headphones',
      description: 'Best sound quality',
    },
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  @Prop({ type: Map, of: String })
  meta: Map<string, string>;

  @ApiPropertyOptional({
    description: 'Tags for better search and categorization.',
    example: ['electronics', 'audio', 'wireless'],
    type: [String],
  })
  @Prop([{ type: String }])
  tags: string[];

  @ApiPropertyOptional({
    description: 'A brief description of the product.',
    example: 'High-quality wireless headphones with noise cancellation.',
  })
  @Prop({ trim: true })
  description: string;

  @ApiPropertyOptional({
    description: 'Product variants like size and color.',
    example: [
      {
        variantName: 'Color',
        variantOptions: ['Black', 'White'],
      },
      {
        variantName: 'Size',
        variantOptions: ['Small', 'Large'],
      },
    ],
    type: () => [VariantOption],
  })
  @Prop({
    type: [VariantOption],
    _id: false,
  })
  variants: VariantOption[];

  @ApiPropertyOptional({
    description: 'Pricing and inventory details per variant.',
    example: [
      {
        price: 99.99,
        quantity: 50,
        attributes: { Color: 'Black', Size: 'Large' },
      },
    ],
    type: [
      {
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        attributes: { type: Map, of: String, required: true },
      },
    ],
  })
  @Prop({
    type: [
      {
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        attributes: { type: Map, of: String, required: true },
      },
    ],
    _id: false,
  })
  variantDetails: Array<{
    price: number;
    quantity: number;
    attributes: Map<string, string>;
  }>;

  @ApiPropertyOptional({
    description: 'The total available stock.',
    example: 100,
    default: 0,
  })
  @Prop({ default: 0 })
  stock: number;

  @ApiPropertyOptional({
    description: 'The reserved stock for pending orders.',
    example: 10,
    default: 0,
  })
  @Prop({ default: 0 })
  reservedStock: number;

  @ApiPropertyOptional({
    description: 'The total number of units sold.',
    example: 500,
    default: 0,
  })
  @Prop({ default: 0 })
  soldCount: number;

  @ApiPropertyOptional({
    description: 'Indicates if the product is active or available for sale.',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'The date when the product becomes available for purchase.',
    example: '2024-01-01',
    default: new Date(),
  })
  @Prop({ default: Date.now })
  availableFrom: Date;

  @ApiPropertyOptional({
    description:
      'The date when the product should be archived or marked as unavailable.',
    example: '2024-12-31',
    default: new Date(),
  })
  @Prop({ default: Date.now })
  availableUntil: Date;

  @ApiPropertyOptional({
    description: 'An array of related product IDs.',
    example: ['605c78f7bcf86cd799439012', '605c78f7bcf86cd799439013'],
    type: [String],
  })
  @Prop({ type: [Types.ObjectId], ref: 'Product' })
  relatedProducts: Types.ObjectId[];

  @ApiPropertyOptional({
    description: 'Dynamic pricing based on location or bulk purchase.',
    example: { NY: 105.99, CA: 100.99 },
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  @Prop({ type: Map, of: Number })
  pricingByLocation: Map<string, number>;

  @ApiPropertyOptional({
    description: 'Customer reviews and ratings.',
    example: [
      {
        userId: '605c78f7bcf86cd799439014',
        rating: 5,
        review: 'Excellent product!',
        createdAt: '2024-08-19T12:00:00Z',
      },
    ],
    type: [
      {
        userId: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        review: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  })
  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, required: true, ref: 'User' },
        rating: { type: Number, required: true, min: 1, max: 5 },
        review: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    _id: false,
  })
  reviews: Array<{
    userId: Types.ObjectId;
    rating: number;
    review: string;
    createdAt: Date;
  }>;

  @ApiPropertyOptional({
    description: 'Indicates if the product is archived (soft deletion).',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  isArchived: boolean;

  //   @ApiPropertyOptional({
  //     description: 'References to orders that include this product.',
  //     example: ['605c78f7bcf86cd799439015', '605c78f7bcf86cd799439016'],
  //     type: [String],
  //   })
  //   @Prop([{ type: Types.ObjectId, ref: 'Order' }])
  //   orders: Types.ObjectId[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ name: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ 'variantDetails.attributes.size': 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ updatedAt: -1 });

// Middleware to update stock based on variantDetails
ProductSchema.pre('save', function (next) {
  if (this.variantDetails && this.variantDetails.length > 0) {
    this.stock = this.variantDetails.reduce(
      (total, variant) => total + variant.quantity,
      0,
    );
  }
  next();
});
