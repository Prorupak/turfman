import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ConfirmEmailDto {
  @ApiProperty({
    description: 'The token used to confirm the user’s email.',
    example: 'abc123def456ghi789',
    maxLength: 255,
  })
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  token: string;
}
