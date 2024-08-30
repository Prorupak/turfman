import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'modules/product/schemas/product.schema';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class OrderItem {
  @ApiProperty({
    description: 'The ID of the ordered product.',
    type: String,
    example: '66c777594aa571f347476767',
  })
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  product: Types.ObjectId;

  @ApiProperty({
    description: 'The quantity of the product ordered.',
    example: 2,
  })
  @Prop({ required: true })
  quantity: number;

  @ApiProperty({
    description: 'The price of the product at the time of order.',
    example: 199.99,
  })
  @Prop({ required: true })
  price: number;

  @ApiProperty({
    description: 'The variant attributes selected by the customer.',
    example: { size: 'medium', color: 'black' },
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  @Prop({ type: Map, of: String })
  variantAttributes: Record<string, string>; // Dynamic attributes map
}
