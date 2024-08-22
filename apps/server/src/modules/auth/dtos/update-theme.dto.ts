import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, Max, Min, ValidateIf } from 'class-validator';

export class UpdateThemeDto {
  @ApiPropertyOptional({
    description:
      'The source color code for the theme as a 32-bit integer (e.g., 0xFFFFFFFF for white).',
    example: 0xffffffff,
    minimum: 0x00000000,
    maximum: 0xffffffff,
    type: Number,
  })
  @Max(0xffffffff)
  @Min(0x00000000)
  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  source: number;
}
