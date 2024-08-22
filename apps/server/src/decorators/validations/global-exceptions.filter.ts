import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { AppError } from 'common/errors';
import { catchMongooseException } from 'common/mongoose';
import { Response } from 'express';

@Catch()
export class GlobalExceptionsFilter extends BaseExceptionFilter {
  private logger = new Logger(GlobalExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    exception = catchMongooseException(exception);

    if (exception instanceof AppError.BasicError) {
      this.logger.error(exception.message);
      response.status(exception.getStatus()).json(exception.getResponseBody());
    }
    super.catch(exception, host);
  }
}
