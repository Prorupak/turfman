import {
  CanActivate,
  ExecutionContext,
  Injectable,
  applyDecorators,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AppError } from 'common/errors';
import { IS_PUBLIC_KEY } from 'decorators/auth';
import { AuthService } from 'modules/auth/auth.service';

/**
 * Class to apply Swagger documentation and guards for secure endpoints.
 *
 * The class offers a static `getDecorators` method that can be used in controllers
 * to apply the relevant decorators.
 *
 * @example
 * ```typescript
 * @Controller('secure')
 * export class SecureController {
 *   @SecureEndpoint.apply()
 *   @Get('data')
 *   getData() {
 *     // Your logic here
 *   }
 * }
 * ```
 */
export class SecureEndpoint {
  static apply() {
    return applyDecorators(
      ApiBearerAuth(),
      ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    );
  }
}

@Injectable()
export class SecurityGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();

    const isPublic =
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    if (isPublic && !user) {
      return true;
    }

    if (await this.authService.verifySecurityStamp(user.securityStamp)) {
      return true;
    }

    throw new AppError.Unauthenticated();
  }
}
