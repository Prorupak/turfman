import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiName } from 'decorators/openapi';
import {
  ConfirmEmailDto,
  ForgotPasswordDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
  UpdateEmailDto,
  UpdateImageDto,
  UpdatePasswordDto,
} from './dtos';
import { Public, User } from 'decorators/auth';
import {
  ConfirmEmailSwaggerDocs,
  ForgotPasswordSwaggerDocs,
  LoginSwaggerDocs,
  RefreshTokenSwaggerDocs,
  RegisterSwaggerDocs,
  ResetPasswordSwaggerDocs,
  RevokeRefreshTokenSwaggerDocs,
  UpdateEmailSwaggerDocs,
  UpdateImageSwaggerDocs,
  UpdatePasswordSwaggerDocs,
  VerifyEmailSwaggerDocs,
} from './auth-swagger.decorator.';
import { LocalAuthGuard, SecureEndpoint } from 'guards';
import { Request } from 'express';
import { AppError } from 'common/errors';
import { messages } from 'constants/messages';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommonFile } from 'constants/';
import { Regex } from '@buzz/utils';
import { Multer } from 'helpers/multer.helper';
import { AuthUser } from './auth-user.class';

@ApiName()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @RegisterSwaggerDocs()
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @LoginSwaggerDocs()
  async login(@Req() req: Request, @Ip() ip: string) {
    return this.authService.login(req.user as any, ip);
  }

  @Post('confirm-email')
  @Public()
  @ConfirmEmailSwaggerDocs()
  async confirmEmail(@Body() dto: ConfirmEmailDto) {
    return this.authService.confirmEmail(dto);
  }

  @Post('forgot-password')
  @Public()
  @ForgotPasswordSwaggerDocs()
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @Public()
  @ResetPasswordSwaggerDocs()
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('refresh-token')
  @Public()
  @RefreshTokenSwaggerDocs()
  async refreshToken(
    @Headers('Refresh-Token') token: string,
    @Ip() ip: string,
  ) {
    if (!token) {
      throw new AppError.Argument(messages.error.notFoundToken);
    }

    return this.authService.refreshToken(token, ip);
  }

  @Patch('revoke-refresh-token')
  @SecureEndpoint.apply()
  @HttpCode(HttpStatus.NO_CONTENT)
  @RevokeRefreshTokenSwaggerDocs()
  async revokeRefreshToken(
    @Headers('Refresh-Token') headerToken: string,
    @Body() dto: RefreshTokenDto,
    @User('id') userId: string,
    @Ip() ip: string,
  ) {
    const token = dto.value ?? headerToken;

    if (!token) {
      throw new AppError.Argument(messages.error.notFoundToken);
    }

    return this.authService.revoke(token, userId, ip);
  }

  @Put(':type(photo|cover)')
  @SecureEndpoint.apply()
  @UseInterceptors(FileInterceptor('image'))
  @UpdateImageSwaggerDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateImage(
    @Query() dto: UpdateImageDto,
    @UploadedFile()
    file: Express.Multer.File,
    @User() user: AuthUser,
  ) {
    const isCover = dto.type === 'cover';

    const { unlink } = Multer.validateFiles(file, {
      fileSize: isCover
        ? CommonFile.IMAGE_MAX_FILE_SIZE * 2
        : CommonFile.IMAGE_MAX_FILE_SIZE,
      mimeTypeRegex: Regex.CommonFile.IMAGE_MIME_TYPES,
      required: true,
      dimensions: {
        equal: true,
        ...(isCover
          ? {
              width: 1280,
              height: 720,
            }
          : {
              width: 1024,
              height: 1024,
            }),
      },
    });

    try {
      await this.authService.updateImage(
        Multer.convertToIFile(file, {
          fileName: isCover ? 'background' : 'avatar',
        }),
        dto,
        user,
      );
    } finally {
      await unlink();
    }
  }

  @Patch('password')
  @SecureEndpoint.apply()
  @UpdatePasswordSwaggerDocs()
  async updatePassword(
    @Body() dto: UpdatePasswordDto,
    @User('id') userId: string,
    @Ip() ip: string,
  ) {
    return this.authService.updatePassword(dto, userId, ip);
  }

  @Patch('email')
  @SecureEndpoint.apply()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UpdateEmailSwaggerDocs()
  async updateEmail(@Body() dto: UpdateEmailDto, @User('id') userId: string) {
    await this.authService.updateEmail(dto, userId);
  }

  @Post('verify-email')
  @SecureEndpoint.apply()
  @VerifyEmailSwaggerDocs()
  async verifyEmail(@User('id') userId: string) {
    return await this.authService.requestVerifyEmail(userId);
  }
}
