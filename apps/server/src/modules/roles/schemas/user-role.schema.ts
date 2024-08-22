import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Document,
  HydratedDocument,
  Schema as MongooseSchema,
  Types,
} from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';

export type UserRoleDocument = HydratedDocument<UserRole>;

@Schema({
  collection: 'user_roles',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class UserRole extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Role',
    required: true,
    autopopulate: { maxDepth: 1 },
  })
  roleId: Types.ObjectId[];

  @Prop({ type: [String], required: true, default: [] })
  roles: string[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRole);

UserRoleSchema.plugin(autoPopulate);

UserRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });
