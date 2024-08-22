import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description:
      'The email address, must be a valid email format and is optional.',
    maxLength: 255,
    required: false,
  })
  @IsEmail()
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  email: string;
}
