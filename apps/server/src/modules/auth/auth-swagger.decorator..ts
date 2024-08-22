import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import {
  ConfirmEmailResponseDto,
  ForgotPasswordResponseDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
  RegisterResponseDto,
  ResetPasswordResponseDto,
} from './dtos/response.dto';
import {
  ConfirmEmailDto,
  ForgotPasswordDto,
  RefreshTokenDto,
  ResetPasswordDto,
  UpdateEmailDto,
  UpdatePasswordDto,
} from './dtos';

export const RegisterSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a role by ID' }),
    ApiResponse({
      status: 200,
      description: 'The user has been successfully registered.',
      type: RegisterResponseDto,
    }),

    ApiBadRequestResponse({
      status: 400,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Cannot delete a default role' },
        },
      },
    }),
  );
};

export const LoginSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'User login' }),
    ApiBody({
      description: 'Request body for login',
      schema: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            required: ['true'],
            example: 'john_doe@gmail.com',
          },
          password: { type: 'string', required: ['true'], example: 'password' },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'User has been successfully logged in.',
      type: LoginResponseDto,
    }),
    ApiBadRequestResponse({
      status: 400,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Invalid credentials' },
        },
      },
    }),
  );
};

export const ConfirmEmailSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Confirm user email using a token' }),
    ApiBody({ type: ConfirmEmailDto }),
    ApiResponse({
      status: 200,
      description: 'Email confirmed successfully',
      type: ConfirmEmailResponseDto,
    }),
    ApiBadRequestResponse({
      status: 400,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Invalid token' },
        },
      },
    }),
  );
};

export const ForgotPasswordSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Request a password reset link' }),
    ApiBody({ type: ForgotPasswordDto }),
    ApiResponse({
      status: 200,
      description:
        'The password reset link was successfully sent to the user’s email',
      type: ForgotPasswordResponseDto,
    }),
    ApiBadRequestResponse({
      status: 400,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: {
            type: 'string',
            example: 'User not found or email not confirmed',
          },
        },
      },
    }),
  );
};

export const ResetPasswordSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Reset the user’s password using a token' }),
    ApiBody({ type: ResetPasswordDto }),
    ApiResponse({
      status: 200,
      description: 'The password was successfully reset',
      type: ResetPasswordResponseDto,
    }),
    ApiBadRequestResponse({
      status: 400,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Invalid or expired token' },
        },
      },
    }),
  );
};

export const RefreshTokenSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Refresh access and refresh tokens using a valid refresh token',
    }),
    ApiHeader({
      name: 'Refresh-Token',
      description: 'The refresh token needed to generate new tokens',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully refreshed tokens',
      type: RefreshTokenResponseDto,
    }),
    ApiBadRequestResponse({
      status: 400,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: {
            type: 'string',
            example: 'Invalid refresh token provided.',
          },
        },
      },
    }),
  );
};

export const RevokeRefreshTokenSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Revoke a refresh token for the user' }),
    ApiHeader({
      name: 'Refresh-Token',
      description:
        'The refresh token passed as a header. It is optional if provided in the body.',
      required: false,
    }),
    ApiBody({
      type: RefreshTokenDto,
      description: 'Optional body input for the refresh token',
      required: false,
    }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'The refresh token was successfully revoked',
    }),
    ApiBadRequestResponse({
      status: 400,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: {
            type: 'string',
            example: 'Invalid refresh token provided.',
          },
        },
      },
    }),
  );
};

export const UpdateImageSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update user profile image (photo or cover)' }),
    ApiConsumes('multipart/form-data'),
    ApiParam({
      name: 'type',
      description: 'Type of image being updated (photo or cover)',
      enum: ['photo', 'cover'],
    }),
    ApiQuery({
      name: 'theme',
      required: false,
      description: 'Generate a theme from the image',
      example: true,
    }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'The image was successfully updated',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid file upload or dimensions',
    }),
  );
};

export const UpdatePasswordSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update the user password' }),
    ApiBody({
      type: UpdatePasswordDto,
      description: 'The current and new password details.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description:
        'The password was successfully updated and new tokens were generated.',
      schema: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          refreshToken: {
            type: 'string',
            example:
              'c2jpygsaelqp0ul6fixe5ubleefxl47lsh1yzofdbgc3agru4z5cixujvktt1mkntsoyrjrbajhxhbuvcfbodfd3srjoze25ln4',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Invalid current password or new password does not meet requirements.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found.',
    }),
  );
};

export const UpdateEmailSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update the user email address' }),
    ApiBody({
      type: UpdateEmailDto,
      description: 'The new email address for the user.',
    }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description:
        'The email address was successfully updated and a confirmation email was sent.',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Invalid email format or the provided email is the same as the current one.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found.',
    }),
  );
};

export const VerifyEmailSwaggerDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary:
        'Request a verification email to be sent to the user’s email address',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Verification email sent successfully.',
      schema: {
        type: 'object',
        properties: {
          email: { type: 'string', example: 'johndoe@gmail.com' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'User has already verified their email or no email is associated with the account.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found.',
    }),
  );
};
