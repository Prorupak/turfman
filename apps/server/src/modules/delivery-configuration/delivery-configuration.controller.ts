import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { DeliveryConfigurationService } from './delivery-configuration.service';
import { Public, Roles } from 'decorators/auth';
import { UserRoles } from 'modules/roles/constants';
import { SecureEndpoint } from 'guards';
import { CreateDeliveryConfigDto } from './dto/create-delivery-configuration.dto';
import { DeliveryConfiguration } from './schema/delivery-configuration.schema';
import {
  CreateDeliveryConfigurationResponseSwaggerDocs,
  DeleteDeliveryConfigurationResponseSwaggerDocs,
  GetAllDeliveryConfigurationResponseSwaggerDocs,
  SingleDeliveryConfigurationResponseSwaggerDocs,
  UpdateDeliveryConfigurationResponseSwaggerDocs,
} from './delivery-configuration-swagger.decorator';
import { ApiName } from 'decorators/openapi';
import { SearchDeliveryConfigDto } from './dto/query-delivery-configuration.dto';
import { FindOneParams } from 'common/dtos';

@ApiName('Delivery Configurations')
@Controller('admin/delivery-configurations')
export class DeliveryConfigurationController {
  constructor(
    private readonly deliveryConfigService: DeliveryConfigurationService,
  ) {}

  @Get()
  @Public()
  @GetAllDeliveryConfigurationResponseSwaggerDocs()
  async findAll(@Query() queryOptions: SearchDeliveryConfigDto) {
    return this.deliveryConfigService.findAll(queryOptions);
  }

  @Get(':id')
  @Public()
  @SingleDeliveryConfigurationResponseSwaggerDocs()
  async findOne(
    @Param() params: FindOneParams.MongoId,
  ): Promise<DeliveryConfiguration> {
    return this.deliveryConfigService.findOne(params.id);
  }

  @Post()
  @Roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN, UserRoles.SALES_ASSISTANCE)
  @SecureEndpoint.apply()
  @CreateDeliveryConfigurationResponseSwaggerDocs()
  async create(
    @Body() createDeliveryConfigDto: CreateDeliveryConfigDto,
  ): Promise<DeliveryConfiguration> {
    return this.deliveryConfigService.create(createDeliveryConfigDto);
  }

  @Patch(':id')
  @Roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN, UserRoles.SALES_ASSISTANCE)
  @SecureEndpoint.apply()
  @UpdateDeliveryConfigurationResponseSwaggerDocs()
  async update(
    @Param() params: FindOneParams.MongoId,
    @Body() createDeliveryConfigDto: CreateDeliveryConfigDto,
  ): Promise<DeliveryConfiguration> {
    return this.deliveryConfigService.update(
      params.id,
      createDeliveryConfigDto,
    );
  }

  @Delete(':id')
  @Roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN, UserRoles.SALES_ASSISTANCE)
  @SecureEndpoint.apply()
  @DeleteDeliveryConfigurationResponseSwaggerDocs()
  async remove(@Param() params: FindOneParams.MongoId): Promise<void> {
    return this.deliveryConfigService.remove(params.id);
  }
}
