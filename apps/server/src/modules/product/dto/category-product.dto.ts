import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty({
    description: 'The name of the category.',
    example: 'Dummy Plastic Bags',
  })
  name: string;

  @ApiProperty({
    description: 'A brief description of the category.',
    example: 'High-quality garden tools and supplies.',
  })
  description: string;

  @ApiProperty({
    description: 'The unique identifier of the category.',
    example: '66c73abbd4c3c13c85b395e4',
  })
  id: string;

  @ApiProperty({
    description: 'The unique identifier of the category.',
    example: 'dummy-plastic-bags',
  })
  slug: string;
}
