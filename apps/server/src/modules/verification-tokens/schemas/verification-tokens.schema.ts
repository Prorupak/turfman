import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { VerificationTokenType } from './verification-tokens.enums';
import { createCustomTokenGenerator } from 'utils';

export type VerificationTokenDocument = HydratedDocument<VerificationToken>;

@Schema({
  collection: 'verification_tokens',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class VerificationToken extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, auto: true })
  id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({
    type: String,
    required: true,
    default: () => createCustomTokenGenerator(),
  })
  token: string;

  @Prop({ type: String, enum: VerificationTokenType, required: true })
  type: VerificationTokenType;

  @Prop({ type: Date, required: true })
  expires: Date;

  @Prop({ type: Date, default: null })
  revoked: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const VerificationTokenSchema =
  SchemaFactory.createForClass(VerificationToken);

// Adding indexes
VerificationTokenSchema.index({ expires: -1, revoked: -1 });
