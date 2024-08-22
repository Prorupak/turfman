import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

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

  @ApiProperty({
    description:
      'Determines if the theme is enabled or disabled. This can accept "true" or "false" as strings and will convert them to boolean.',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  theme: boolean;
}
