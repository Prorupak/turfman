import { ApiProperty } from '@nestjs/swagger';

/**
 * Represents the response received upon a successful user registration.
 */
export class RegisterResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the registered user.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The username of the registered user.',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'The display name of the registered user.',
    example: 'John Doe',
  })
  displayName: string;

  @ApiProperty({
    description: 'The email address of the registered user.',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The timestamp when the user was created.',
    example: '2024-08-19T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The timestamp when the user was last updated.',
    example: '2024-08-19T12:00:00.000Z',
  })
  updatedAt: Date;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT Access Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT Refresh Token',
    example: 'zuiucfcoolokjg63sz58nceyx03tmam3mlvussgl...',
  })
  refreshToken: string;
}

export class ConfirmEmailResponseDto {
  @ApiProperty({
    description: 'Username of the confirmed user',
    example: 'john_doe',
  })
  username: string;
}

export class ForgotPasswordResponseDto {
  @ApiProperty({
    description: 'Email address where the reset password link was sent',
    example: 'rupak@gmail.com',
  })
  email: string;
}

export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Username of the user whose password was reset',
    example: 'john_doe',
  })
  username: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'JWT Access Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'New Refresh Token',
    example:
      'xh7bv7p2n9d9ir7e14lzmookpsau8qfcoym6ra9q09wgr5itsh9hmag1v4z8r4fhi6bhoqgjkfpzj2oxtlxkhodnq9g1om8ycp',
  })
  refreshToken: string;
}
