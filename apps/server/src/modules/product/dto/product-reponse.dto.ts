import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from './product.dto';
import { PaginatedResponse } from 'helpers/pagination/pagination.types';

export class PaginatedProductDetailsResponseDto extends PaginatedResponse {
  @ApiProperty({
    description: 'The list of products for the current page.',
    type: [ProductDto],
  })
  data: ProductDto[];
}

export class SingleProductResponseDto extends ProductDto {
  @ApiProperty({
    description: 'An array of related products.',
    type: [ProductDto],
  })
  relatedProducts: ProductDto[];
}
