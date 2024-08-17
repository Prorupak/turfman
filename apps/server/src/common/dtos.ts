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
  @Min(0)
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  skip?: number;

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
  abstract cursor?: Cursor;

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
  abstract excludeIds?: Array<Id>;

  @Max(100)
  @Min(10)
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  take?: number;
}

export namespace FindOneParams {
  export class Number {
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    id: number;
  }

  export class MongoId {
    @IsMongoId()
    @IsString()
    @IsNotEmpty()
    @Type(() => String)
    id: string;
  }
}
