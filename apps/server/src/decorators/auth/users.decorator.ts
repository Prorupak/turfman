import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser, AuthPrincipal } from 'modules/auth/auth-user.class';

/**
 * Custom decorator to extract the user from the request object.
 * Optionally, you can pass a specific key (e.g., 'id') to extract that particular property.
 *
 * Example: @User('id') -> returns user.id
 */
export const User = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    return data ? user?.[data] : user;
  },
);

/**
 * Custom decorator to extract the principal from the request object.
 *
 * Example: @Principal() -> returns request.principal
 */
export const Principal = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const principal: AuthPrincipal = request.principal;

    return principal;
  },
);
