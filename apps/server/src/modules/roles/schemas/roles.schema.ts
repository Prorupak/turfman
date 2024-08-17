import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RoleDocument = Role & Document;

@Schema({
  collection: 'roles',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class Role extends Document {
  @Prop({
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    minlength: [2, 'Role name must be at least 2 characters long'],
    maxlength: [255, 'Role name cannot exceed 255 characters'],
  })
  name: string;

  @Prop({ type: Number, required: true })
  sort: number;

  @Prop({ type: Boolean, default: false })
  default: boolean;

  @Prop({ type: Types.ObjectId, ref: 'UserRole' })
  userRoles: Types.ObjectId[];

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now() })
  updatedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.index({ sort: 1 });
RoleSchema.index({ createdAt: -1 });
