import { Regex } from '@buzz/utils';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'john_doe',
    description:
      'The username must be between 4 and 16 characters long and match the specified pattern.',
    maxLength: 16,
    minLength: 4,
  })
  @Matches(Regex.Validate.USERNAME)
  @MaxLength(16)
  @MinLength(4)
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'John Doe',
    description:
      'The display name, must be a non-empty string with a maximum length of 64 characters.',
    maxLength: 64,
  })
  @MaxLength(64)
  @IsString()
  @IsNotEmpty()
  displayName: string;

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
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd!',
    description:
      'The password must be between 8 and 64 characters long and match the specified pattern.',
    maxLength: 64,
    minLength: 8,
  })
  @Matches(Regex.Validate.PASSWORD)
  @MaxLength(64)
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  password: string;
}
