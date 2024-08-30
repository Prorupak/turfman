import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order-management.dto';

export class UpdateOrderManagementDto extends PartialType(CreateOrderDto) {}
