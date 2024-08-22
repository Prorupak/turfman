import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
  collection: 'categories',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class Category extends Document {
  @ApiProperty({
    description: 'The unique name of the category.',
    example: 'Electronics',
    minLength: 3,
    maxLength: 100,
  })
  @Prop({
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 100,
    trim: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'A brief description of the category.',
    example:
      'This category includes electronic products such as phones, laptops, etc.',
    maxLength: 500,
  })
  @Prop({
    maxlength: 500,
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'The URL for the category image.',
    example: 'https://example.com/category-image.jpg',
  })
  @Prop({
    validate: {
      validator: function (v: string) {
        return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(v);
      },
      message: 'Invalid URL format',
    },
  })
  @IsOptional()
  @IsUrl()
  imageUrl: string;

  @ApiPropertyOptional({
    description: 'The parent category ID (if this category is a subcategory).',
    type: String,
  })
  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    default: null,
  })
  @IsOptional()
  @Type(() => Types.ObjectId)
  parentCategory: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'An array of related category IDs.',
    type: [String],
  })
  @Prop([{ type: Types.ObjectId, ref: 'Category' }])
  @IsOptional()
  @Type(() => Types.ObjectId)
  relatedCategories: Types.ObjectId[];

  @ApiPropertyOptional({
    description: 'An array of associated product IDs.',
    type: [String],
  })
  @Prop([{ type: Types.ObjectId, ref: 'Product' }])
  @IsOptional()
  @Type(() => Types.ObjectId)
  products: Types.ObjectId[];

  @ApiProperty({
    description: 'Indicates whether the category is active.',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'The display order of the category.',
    example: 1,
    minimum: 0,
    default: 0,
  })
  @Prop({
    default: 0,
    min: 0,
  })
  @IsNumber()
  @Min(0)
  displayOrder: number;

  @ApiPropertyOptional({
    description: 'Unique slug of the category.',
    example: 'unique-slug',
  })
  @Prop({
    type: String,
    required: true,
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Creation date of product.',
    example: 'Thu Aug 22 2024 21:29:50 GMT+0545 (Nepal Time)',
    type: Date,
  })
  @Prop({ type: Date, default: Date.now() })
  createdAt?: Date;

  @ApiPropertyOptional({
    description: 'Updated date of product.',
    example: 'Thu Aug 22 2024 21:29:50 GMT+0545 (Nepal Time)',
    type: Date,
  })
  @Prop({ type: Date, default: Date.now() })
  updatedAt?: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
