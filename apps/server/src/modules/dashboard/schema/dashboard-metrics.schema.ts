import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type DashboardMetricsDocument = HydratedDocument<DashboardMetrics>;

@Schema({
  collection: 'dashboard_metrics',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class DashboardMetrics {
  @ApiProperty({
    description: 'The total number of returned products.',
    example: 50,
  })
  @Prop({ default: 0 })
  totalReturns: number;

  @ApiProperty({
    description: 'The rate of product returns as a percentage.',
    example: 5.0,
  })
  @Prop({ default: 0 })
  returnRate: number;

  @ApiProperty({
    description: 'The total revenue impact of returned products.',
    example: 5000.0,
  })
  @Prop({ default: 0 })
  totalRevenueImpact: number;

  @ApiPropertyOptional({
    description:
      'An object representing reasons for product returns and their counts.',
    example: { 'Damaged product': 10, 'Wrong item': 5 },
    type: Object,
  })
  @Prop({ type: Map, of: Number, default: {} })
  returnReasons: Map<string, number>;

  @ApiPropertyOptional({
    description: 'The date when metrics were last updated.',
    example: '2024-08-29T03:43:32.702Z',
  })
  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const DashboardMetricsSchema =
  SchemaFactory.createForClass(DashboardMetrics);
