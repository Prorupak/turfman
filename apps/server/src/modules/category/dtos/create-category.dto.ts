import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsBoolean,
  IsMongoId,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category.',
    example: 'Garden Supplies',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'A brief description of the category.',
    example: 'High-quality garden tools and supplies.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the category is active.',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    description: 'The ID of the parent category, if this category is nested.',
    example: '60b8d295f1d2b32744bff4a3',
    type: String,
  })
  @IsMongoId()
  @IsOptional()
  parentCategory?: string;

  @ApiPropertyOptional({
    description: 'Related category IDs for cross-navigation.',
    example: ['60b8d295f1d2b32744bff4a3', '60b8d2a2f1d2b32744bff4a4'],
    type: [String],
    isArray: true,
  })
  @IsString({ each: true })
  @IsOptional()
  relatedCategories?: Array<string>;
}
