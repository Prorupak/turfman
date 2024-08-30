/**
 * @file pagination.ts
 * @description Type definitions for a generic paginated response structure.
 */

export type PaginatedResponse<T> = PaginationType & {
  data: T[];
};

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
  "DESC" = -1,
  "ASC" = 1,
}
export type ISort = {
  [key: string]: SORT_DIRECTION;
};

export type ISelect = {
  [key: string]: any;
};

export type PaginationPipeline<T, U = {}> = {
  paginationPipeline: U[];
  paginationData: T;
};
