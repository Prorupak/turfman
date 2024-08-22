import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import dayjs from 'dayjs';
import {
  VerificationToken,
  VerificationTokenDocument,
} from './schemas/verification-tokens.schema';
import { VerificationTokenType } from './schemas/verification-tokens.enums';
import { AppError } from 'common/errors';
import { messages } from 'constants/messages';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';

dayjs.extend(isSameOrBefore);
dayjs.extend(utc);

@Injectable()
export class VerificationTokensService {
  constructor(
    @InjectModel(VerificationToken.name)
    private verificationTokenModel: Model<VerificationTokenDocument>,
  ) {}

  async generateToken(
    userId: string,
    type: VerificationTokenType,
    expires?: Date,
  ) {
    const token = await this.verificationTokenModel.create({
      userId,
      type,
      expires: expires ?? dayjs().add(5, 'minutes').toDate(),
    });
    return token;
  }

  async revokeToken(token: string, type: VerificationTokenType) {
    const verificationToken = await this.verificationTokenModel
      .findOne({
        token,
        type,
      })
      .exec();

    if (
      !verificationToken ||
      verificationToken.revoked ||
      dayjs(verificationToken.expires).isSameOrBefore(dayjs())
    ) {
      throw new AppError.Argument(messages.error.verificationToken);
    }

    verificationToken.revoked = dayjs().toDate();
    await verificationToken.save();

    return verificationToken;
  }

  async getTokenActive(token: string, type: VerificationTokenType) {
    const verificationToken = await this.verificationTokenModel
      .findOne({
        token,
        type,
      })
      .exec();

    if (
      !verificationToken ||
      verificationToken.revoked ||
      dayjs(verificationToken.expires).isSameOrBefore(dayjs())
    ) {
      throw new AppError.Argument(messages.error.verificationToken);
    }

    return verificationToken;
  }
}
