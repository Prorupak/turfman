import { ApiProperty } from '@nestjs/swagger';
import { PipelineStage } from 'mongoose';

export type IPaginatedResponse<T> = PaginationType & {
  data: T[];
};

export class PaginatedResponse implements PaginationType {
  // for each extension of this, implement the data: T type. Swagger doesnt support generics, so this is the workaround
  // @ApiProperty()
  // data: T[]
  @ApiProperty({
    description: 'The current page number.',
    example: 1,
  })
  page?: number;

  @ApiProperty({
    description: 'The number of items per page.',
    example: 10,
  })
  perPage?: number;

  @ApiProperty({
    description: 'The total number of items.',
    example: 100,
  })
  total?: number;

  @ApiProperty({
    description: 'The total number of pages.',
    example: 10,
  })
  totalPage?: number;
}

export type PaginationType = {
  page?: number;
  perPage?: number;
  total?: number;
  totalPage?: number;
};

export type NewPaginationType = {
  startItem?: number;
  numberOfItems?: number;
  total?: number;
  totalPage?: number;
};

export enum SORT_DIRECTION {
  'DESC' = -1,
  'ASC' = 1,
}
export type ISort = {
  [key: string]: SORT_DIRECTION;
};

export type ISelect = {
  [key: string]: any;
};

export type PaginationPipeline<T> = {
  paginationPipeline: PipelineStage[];
  paginationData: T;
};
