import { ApiProperty } from '@nestjs/swagger';
import { PaginationType } from '@buzz/types';
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
