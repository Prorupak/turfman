import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import _ from 'lodash';
import { PaginationOffset } from 'common/dtos';
import { EmailState, SearchMatch } from 'common/enum';

export const SearchUsersSort = {
  username: 'username',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export type SearchUsersSort =
  (typeof SearchUsersSort)[keyof typeof SearchUsersSort];

export class SearchUsersSortDto {
  @ApiProperty({
    description: 'The field by which to sort the users.',
    enum: SearchUsersSort,
    example: 'createdAt',
  })
  @IsIn(_.values(SearchUsersSort))
  @IsString()
  @IsNotEmpty()
  field: SearchUsersSort;

  @ApiProperty({
    description: 'The order in which to sort the users.',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @IsString()
  @IsNotEmpty()
  order: 'asc';

  static initDefault() {
    const obj = new SearchUsersSortDto();
    obj.field = SearchUsersSort.createdAt;
    obj.order = 'asc';
    return obj;
  }
}

export class SearchUsersDto extends PaginationOffset {
  @ApiPropertyOptional({
    description: 'Filter by username.',
    example: 'john_doe',
    maxLength: 255,
  })
  @MaxLength(255)
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description: 'Filter by name.',
    example: 'John Doe',
    maxLength: 255,
  })
  @MaxLength(255)
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by email address.',
    example: 'john.doe@example.com',
    maxLength: 450,
  })
  @MaxLength(450)
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filter by email states.',
    enum: EmailState,
    isArray: true,
    example: ['verified', 'unverified'],
  })
  @IsIn(_.values(EmailState), { each: true })
  @ArrayUnique()
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  emailStates?: Array<EmailState>;

  @ApiPropertyOptional({
    description: 'Filter by role IDs.',
    example: ['role1', 'role2'],
    maxLength: 10,
  })
  @ArrayUnique()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsOptional()
  roleIds?: Array<string>;

  @ApiPropertyOptional({
    description: 'Specify the mode for role matching.',
    enum: SearchMatch,
    example: 'exact',
  })
  @IsIn(_.values(SearchMatch))
  @IsString()
  @IsOptional()
  roleMode?: SearchMatch;

  @ApiPropertyOptional({
    description: 'Specify the sorting criteria.',
    type: SearchUsersSortDto,
    default: SearchUsersSortDto.initDefault(),
  })
  @ValidateNested()
  @IsObject()
  @IsOptional()
  @Type(() => SearchUsersSortDto)
  @Transform(({ value }) => (value ? value : SearchUsersSortDto.initDefault()))
  sort: SearchUsersSortDto = SearchUsersSortDto.initDefault();
}
