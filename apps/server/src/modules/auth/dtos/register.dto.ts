import { Regex } from '@buzz/utils';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({
    example: 'John',
    description:
      'The first name, must be a non-empty string with a maximum length of 64 characters.',
    maxLength: 64,
  })
  @MaxLength(64)
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description:
      'The last name, must be a non-empty string with a maximum length of 64 characters.',
    maxLength: 64,
  })
  @MaxLength(64)
  @IsString()
  @IsNotEmpty()
  lastName: string;

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

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isAdmin?: boolean;
}
