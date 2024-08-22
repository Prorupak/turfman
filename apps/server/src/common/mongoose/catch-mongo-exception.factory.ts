import { Logger } from '@nestjs/common';
import { AppError } from 'common/errors';
import { Error as MongooseError } from 'mongoose';

const logger = new Logger('MongooseService');

export function catchMongooseException(exception: unknown) {
  if (
    exception instanceof MongooseError.ValidationError ||
    exception instanceof MongooseError.CastError ||
    exception instanceof MongooseError.DocumentNotFoundError ||
    exception instanceof MongooseError.MongooseServerSelectionError ||
    exception instanceof MongooseError.MissingSchemaError
  ) {
    logger.error(exception.message);
    return new AppError.Mongo().setEvent(exception.message);
  }

  return exception;
}
