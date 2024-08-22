import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SortRoleDto {
  @ApiProperty({
    example: '60b8d2958e4e1f001f8f2a5d',
    description:
      'The unique identifier of the role, should be a valid MongoDB ObjectId',
  })
  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    example: 1,
    description: 'The sort order of the role, must be a positive integer',
  })
  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  sort: number;
}
