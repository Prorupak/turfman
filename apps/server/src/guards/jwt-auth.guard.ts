import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AppError } from 'common/errors';
import { IS_PUBLIC_KEY } from 'decorators/auth';
import { AuthPrincipal, AuthUser } from 'modules/auth/auth-user.class';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest(
    err: unknown,
    user: AuthUser,
    _info: unknown,
    context: ExecutionContext,
  ) {
    const req = context.switchToHttp().getRequest();
    req.principal = new AuthPrincipal((user ||= undefined));

    const isPublic =
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    if (isPublic && !user) {
      return null;
    }

    if (err || !user) {
      throw new AppError.Unauthenticated();
    }

    return user as any;
  }
}
