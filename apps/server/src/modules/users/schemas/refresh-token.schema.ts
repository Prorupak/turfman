import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({
  collection: 'refresh_tokens',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class RefreshToken extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: String, required: true })
  token: string;

  @Prop({ type: Date, required: true })
  expires: Date;

  @Prop({ type: String, required: true })
  createdByIp: string;

  @Prop({ type: Date, default: null })
  revoked: Date | null;

  @Prop({ type: String, default: null })
  revokedByIp: string | null;

  @Prop({ type: String, default: null })
  replaceByToken: string | null;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

// Create indexes as defined in the Prisma schema
export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
RefreshTokenSchema.index({ expires: -1, revoked: -1 });
