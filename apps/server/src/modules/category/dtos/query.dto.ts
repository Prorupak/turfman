import { SORT_DIRECTION } from '@turfman/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  IsBoolean,
  IsMongoId,
  IsNumber,
} from 'class-validator';
import { PaginationOffset } from 'common/dtos';
import _ from 'lodash';

export const CategorySortFields = {
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export type CategorySortFields =
  (typeof CategorySortFields)[keyof typeof CategorySortFields];

export class CategorySortDto {
  @ApiProperty({
    description: 'The field by which to sort the categories.',
    enum: CategorySortFields,
    example: 'createdAt',
  })
  @IsIn(_.values(CategorySortFields))
  @IsString()
  @IsNotEmpty()
  field: CategorySortFields;

  @ApiProperty({
    description: 'The order in which to sort the categories.',
    enum: Object.values(SORT_DIRECTION),
    example: SORT_DIRECTION.ASC,
  })
  @IsIn(Object.values(SORT_DIRECTION))
  @IsNumber()
  @IsNotEmpty()
  order: SORT_DIRECTION.ASC | SORT_DIRECTION.DESC;

  static initDefault() {
    const obj = new CategorySortDto();
    obj.field = CategorySortFields.updatedAt;
    obj.order = SORT_DIRECTION.ASC;
    return obj;
  }
}

export class SearchCategoriesDto extends PaginationOffset {
  @ApiPropertyOptional({
    description: 'Search by category name or by category description..',
    example: 'Garden Supplies or High-quality garden tools and supplies.',
    maxLength: 255,
  })
  @MaxLength(255)
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status.',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by parent category ID.',
    example: '60b8d295f1d2b32744bff4a3',
    type: String,
  })
  @IsMongoId()
  @IsOptional()
  parentCategory?: string;

  @ApiPropertyOptional({
    description: 'Filter by related category IDs.',
    example: ['60b8d295f1d2b32744bff4a3', '60b8d2a2f1d2b32744bff4a4'],
    isArray: true,
  })
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  @IsOptional()
  relatedCategories?: Array<string>;

  @ApiPropertyOptional({
    description: 'Specify the sorting criteria.',
    type: CategorySortDto,
    default: CategorySortDto.initDefault(),
  })
  @ValidateNested()
  @IsObject()
  @IsOptional()
  @Type(() => CategorySortDto)
  @Transform(({ value }) => (value ? value : CategorySortDto.initDefault()))
  sort: CategorySortDto = CategorySortDto.initDefault();
}
