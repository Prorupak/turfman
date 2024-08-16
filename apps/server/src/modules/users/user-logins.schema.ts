// File path: src/schemas/user-logins.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type UserLoginsDocument = Document & UserLogins;

@Schema({
  collection: 'user_logins',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class UserLogins extends Document {
  @Prop({
    default: () => new mongoose.Types.ObjectId(),
    required: true,
  })
  id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: String, required: true })
  providerName: string;

  @Prop({ type: String, required: true })
  providerKey: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserLoginsSchema = SchemaFactory.createForClass(UserLogins);
UserLoginsSchema.index({ userId: 1, providerName: 1 }, { unique: true });
UserLoginsSchema.index({ providerName: 1, providerKey: 1 }, { unique: true });
