import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiPropertyOptional({
    description:
      'The refresh token value used to obtain a new access token. This field is optional.',
    example: 'refresh_token_abc123def456',
    maxLength: 255,
  })
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  value?: string;
}
