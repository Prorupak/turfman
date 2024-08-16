// src/schemas/role.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RoleDocument = Role & Document;

@Schema({
  collection: 'roles',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Role extends Document {
  @Prop({
    type: String,
    required: true,
    unique: true,
    default: () => new Types.ObjectId(),
  })
  id: string;

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
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// Adding an index for sort
RoleSchema.index({ sort: 1 });
