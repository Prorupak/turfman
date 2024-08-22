import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateRoleDto {
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
