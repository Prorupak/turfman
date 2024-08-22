import { Provider, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { DtoParseInterceptor } from 'decorators/validations/dto-parse.interceptor';
import { GlobalExceptionsFilter } from 'decorators/validations/global-exceptions.filter';
import { exceptionFactory } from 'decorators/validations/validation.factory';
import { JwtAuthGuard, RolesGuard, SecurityGuard } from 'guards';

export const appProviders: Array<Provider> = [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
  {
    provide: APP_GUARD,
    useClass: SecurityGuard,
  },
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
  {
    provide: APP_PIPE,
    useFactory: () =>
      new ValidationPipe({
        transform: true,
        exceptionFactory,
      }),
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: DtoParseInterceptor,
  },
  {
    provide: APP_FILTER,
    useClass: GlobalExceptionsFilter,
  },
];
