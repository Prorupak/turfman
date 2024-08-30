import { SORT_DIRECTION } from '@turfman/types';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { PaginationOffset } from 'common/dtos';
import _ from 'lodash';

export const DeliveryConfigSortFields = {
  category: 'category',
  flatRate: 'flatRate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export type DeliveryConfigSortFields =
  (typeof DeliveryConfigSortFields)[keyof typeof DeliveryConfigSortFields];

export class DeliveryConfigSortDto {
  @ApiProperty({
    description: 'The field by which to sort the delivery configurations.',
    enum: DeliveryConfigSortFields,
    example: 'flatRate',
  })
  @IsIn(_.values(DeliveryConfigSortFields))
  @IsString()
  @IsNotEmpty()
  field: DeliveryConfigSortFields;

  @ApiProperty({
    description: 'The order in which to sort the delivery configurations.',
    enum: Object.values(SORT_DIRECTION),
    example: SORT_DIRECTION.ASC,
  })
  @IsIn(Object.values(SORT_DIRECTION))
  @IsNumber()
  @IsNotEmpty()
  order: SORT_DIRECTION.ASC | SORT_DIRECTION.DESC;

  static initDefault() {
    const obj = new DeliveryConfigSortDto();
    obj.field = DeliveryConfigSortFields.createdAt;
    obj.order = SORT_DIRECTION.ASC;
    return obj;
  }
}

export class SearchDeliveryConfigDto extends PaginationOffset {
  @ApiPropertyOptional({
    description: 'Search by category name or flat rate.',
    example: 'Turf',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by category ID.',
    example: '60b8d295f1d2b32744bff4a3',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by active/inactive status.',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Specify the sorting criteria.',
    type: DeliveryConfigSortDto,
    default: DeliveryConfigSortDto.initDefault(),
  })
  @ValidateNested()
  @IsObject()
  @IsOptional()
  @Type(() => DeliveryConfigSortDto)
  @Transform(({ value }) =>
    value ? value : DeliveryConfigSortDto.initDefault(),
  )
  sort: DeliveryConfigSortDto = DeliveryConfigSortDto.initDefault();
}
