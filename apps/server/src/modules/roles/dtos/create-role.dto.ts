import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    example: 'Administrator',
    description:
      'The name of the role, must be a non-empty string with a maximum length of 255 characters',
    maxLength: 255,
  })
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;
}
