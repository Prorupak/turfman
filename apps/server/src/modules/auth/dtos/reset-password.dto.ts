import { ApiProperty } from '@nestjs/swagger';
import { Regex } from '@turfman/utils';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'The token required to reset the password.',
    example: 'abc123def456ghi789',
    maxLength: 255,
  })
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description:
      'The new password for the account. It should meet complexity requirements.',
    example: 'StrongPassword123!',
    minLength: 8,
    maxLength: 64,
  })
  @Matches(Regex.Validate.PASSWORD, {
    message: 'Password does not meet complexity requirements.',
  })
  @MaxLength(64)
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  password: string;
}
