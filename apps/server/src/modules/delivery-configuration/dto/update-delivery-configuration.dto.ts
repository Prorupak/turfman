import { PartialType } from '@nestjs/swagger';
import { CreateDeliveryConfigDto } from './create-delivery-configuration.dto';

export class UpdateDeliveryConfigurationDto extends PartialType(
  CreateDeliveryConfigDto,
) {}
