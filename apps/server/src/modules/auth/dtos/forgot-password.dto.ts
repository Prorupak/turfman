import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'The username of the user who wants to reset their password.',
    example: 'john_doe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;
}
