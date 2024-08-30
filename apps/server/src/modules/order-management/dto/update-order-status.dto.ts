import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../order-management.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'The new status for the order.',
    enum: Object.values(OrderStatus),
    example: 'completed',
  })
  @IsIn(Object.values(OrderStatus))
  @IsNotEmpty()
  status: OrderStatus;
}
