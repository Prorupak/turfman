import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateEmailDto {
  @ApiProperty({
    description:
      'The new email address for the user. It must be a valid email format.',
    example: 'user@example.com',
    maxLength: 255,
  })
  @MaxLength(255)
  @IsEmail({}, { message: 'Invalid email format.' })
  @IsString()
  @IsNotEmpty()
  email: string;
}
