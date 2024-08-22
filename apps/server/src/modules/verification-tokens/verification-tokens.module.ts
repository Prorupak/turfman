import { Module } from '@nestjs/common';
import { VerificationTokensService } from './verification-tokens.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  VerificationToken,
  VerificationTokenSchema,
} from './schemas/verification-tokens.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VerificationToken.name, schema: VerificationTokenSchema },
    ]),
  ],
  providers: [VerificationTokensService],
  exports: [VerificationTokensService],
})
export class VerificationTokensModule {}
