import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateImageDto {
  @ApiProperty({
    description:
      'Specifies the type of image being updated, either "photo" or "cover".',
    example: 'photo',
    enum: ['photo', 'cover'],
  })
  @IsString()
  @IsNotEmpty()
  type: 'photo' | 'cover';
}
