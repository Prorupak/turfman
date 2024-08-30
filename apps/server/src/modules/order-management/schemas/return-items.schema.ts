import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class ReturnItem {
  @ApiProperty({
    description: 'The ID of the product being returned.',
    type: String,
    example: '60b8d295f1d2b32744bff4a3',
  })
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @ApiProperty({
    description: 'The quantity of the product being returned.',
    example: 2,
  })
  @Prop({ required: true })
  quantity: number;

  @ApiPropertyOptional({
    description: 'The reason for returning the product.',
    example: 'Defective',
  })
  @Prop()
  reason: string;

  @ApiPropertyOptional({
    description:
      'Additional attributes for the returned product, such as color, size, etc.',
    example: { color: 'red', size: 'medium' },
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  @Prop({ type: Map, of: String, default: {} })
  attributes: Map<string, string>;
}

export const ReturnItemSchema = SchemaFactory.createForClass(ReturnItem);
