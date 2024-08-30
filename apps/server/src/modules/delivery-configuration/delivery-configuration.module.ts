import { Module } from '@nestjs/common';
import { DeliveryConfigurationService } from './delivery-configuration.service';
import { DeliveryConfigurationController } from './delivery-configuration.controller';
import { PaginationModule } from 'helpers/pagination/pagination.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DeliveryConfiguration,
  DeliveryConfigurationSchema,
} from './schema/delivery-configuration.schema';
import { CategoryModule } from 'modules/category/category.module';

const mongoose = MongooseModule.forFeature([
  { name: DeliveryConfiguration.name, schema: DeliveryConfigurationSchema },
]);

@Module({
  imports: [PaginationModule, CategoryModule, mongoose],
  controllers: [DeliveryConfigurationController],
  providers: [DeliveryConfigurationService],
  exports: [DeliveryConfigurationService, mongoose],
})
export class DeliveryConfigurationModule {}
