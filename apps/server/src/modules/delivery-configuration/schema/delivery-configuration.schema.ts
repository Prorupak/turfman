import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';
import { Category } from 'modules/category/schemas/category.schema'; // Import the Category schema

export type DeliveryConfigurationDocument =
  HydratedDocument<DeliveryConfiguration>;

@Schema({
  collection: 'delivery_configurations',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class DeliveryConfiguration {
  @ApiProperty({
    description:
      'Reference to the category this delivery configuration applies to.',
    type: String,
    example: '66c73abbd4c3c13c85b395e4',
  })
  @Prop({ type: Types.ObjectId, ref: Category.name, required: true })
  category: Types.ObjectId; // Reference to the Category model

  @ApiPropertyOptional({
    description: 'Flat rate for delivery if applicable.',
    example: 50.0,
  })
  @Prop({ required: false })
  flatRate?: number;

  @ApiPropertyOptional({
    description:
      'Region-specific delivery rates, with regions as keys and rates as values.',
    example: { NY: 75.0, CA: 100.0 },
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  @Prop({ type: Map, of: Number })
  regionSpecificRates?: Record<string, number>;

  @ApiPropertyOptional({
    description:
      'List of applicable postcodes where this delivery configuration applies.',
    example: ['10001', '20002', '94101'],
    type: [String],
  })
  @Prop([String || Number])
  applicablePostcodes?: Array<string | number>;

  @ApiProperty({
    description: 'Indicates if the delivery configuration is active.',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Creation date of config.',
    example: 'Thu Aug 22 2024 21:29:50 GMT+0545 (Nepal Time)',
    type: Date,
  })
  @Prop({ type: Date, default: Date.now() })
  createdAt?: Date;

  @ApiPropertyOptional({
    description: 'Updated date of config.',
    example: 'Thu Aug 22 2024 21:29:50 GMT+0545 (Nepal Time)',
    type: Date,
  })
  @Prop({ type: Date, default: Date.now() })
  updatedAt?: Date;
}

export const DeliveryConfigurationSchema = SchemaFactory.createForClass(
  DeliveryConfiguration,
);

DeliveryConfigurationSchema.index({ createdAt: -1 });
DeliveryConfigurationSchema.index({ updatedAt: -1 });
DeliveryConfigurationSchema.index({ category: 1 });
DeliveryConfigurationSchema.index({ flatRate: 1 });
