import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Regex } from '@turfman/utils';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdatePasswordDto {
  @ApiPropertyOptional({
    description:
      'The current password of the user. This field is optional but required if you are changing the password.',
    example: 'CurrentPassword123!',
    maxLength: 64,
  })
  @MaxLength(64)
  @IsString()
  @IsOptional()
  currentPassword: string;

  @ApiProperty({
    description:
      'The new password for the account. It should meet the complexity requirements.',
    example: 'NewStrongPassword123!',
    minLength: 8,
    maxLength: 64,
  })
  @Matches(Regex.Validate.PASSWORD, {
    message: 'The new password does not meet the complexity requirements.',
  })
  @MaxLength(64)
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
