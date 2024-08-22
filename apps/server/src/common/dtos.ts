import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export abstract class PaginationOffset {
  @ApiPropertyOptional({
    description: 'The number of items to skip.',
    example: 0,
    minimum: 0,
    type: Number,
  })
  @Min(0)
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  skip?: number;

  @ApiPropertyOptional({
    description:
      'The maximum number of items to retrieve. Must be between 10 and 100.',
    example: 20,
    minimum: 10,
    maximum: 100,
    type: Number,
  })
  @Max(100)
  @Min(10)
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  take?: number;
}

export abstract class PaginationCursor<
  Cursor extends string | number = string,
> {
  @ApiPropertyOptional({
    description: 'The cursor value to continue pagination from.',
    type: String,
    example: 'abc123',
  })
  abstract cursor?: Cursor;

  @ApiPropertyOptional({
    description:
      'The maximum number of items to retrieve. Must be between 10 and 100.',
    example: 20,
    minimum: 10,
    maximum: 100,
    type: Number,
  })
  @Max(100)
  @Min(10)
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  take?: number;
}

export abstract class PaginationExcludeIds<
  Id extends number | string = string,
> {
  @ApiPropertyOptional({
    description: 'An array of IDs to exclude from the results.',
    isArray: true,
    type: [String], // This assumes the default ID is a string.
    example: ['id1', 'id2'],
  })
  abstract excludeIds?: Array<Id>;

  @ApiPropertyOptional({
    description:
      'The maximum number of items to retrieve. Must be between 10 and 100.',
    example: 20,
    minimum: 10,
    maximum: 100,
    type: Number,
  })
  @Max(100)
  @Min(10)
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  take?: number;
}

export namespace FindOneParams {
  export class Number {
    @ApiProperty({
      description: 'The numeric ID of the entity.',
      example: 1,
      type: Number,
    })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    id: number;
  }

  export class MongoId {
    @ApiProperty({
      description: 'The MongoDB ObjectId of the entity.',
      example: '60b8d295f1d2b32744bff4a3',
      type: String,
    })
    @IsMongoId()
    @IsString()
    @IsNotEmpty()
    @Type(() => String)
    id: string;
  }
}
