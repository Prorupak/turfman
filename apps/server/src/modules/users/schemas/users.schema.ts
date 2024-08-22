import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type UserDocument = HydratedDocument<User>;

@Schema({
  collection: 'users',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class User extends Document {
  @Prop({
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minlength: [4, 'Username must be at least 4 characters long'],
    maxlength: [255, 'Username cannot exceed 255 characters'],
  })
  username: string;

  @Prop({
    type: String,
    required: false,
    minlength: [6, 'Password must be at least 6 characters long'],
    maxlength: [255, 'Password cannot exceed 255 characters'],
  })
  password?: string;

  @Prop({ type: String, required: true })
  displayName: string;

  @Prop({
    type: String,
    required: false,
    match: [/\S+@\S+\.\S+/, 'Email is not valid'],
  })
  email?: string;

  @Prop({ type: Boolean, default: false })
  emailConfirmed: boolean;

  @Prop({ type: String })
  firstName?: string;

  @Prop({ type: String })
  lastName?: string;

  @Prop({ type: Date })
  birthDate?: Date;

  @Prop({ type: String })
  location?: string;

  @Prop({ type: String })
  biography?: string;

  @Prop({ type: String })
  websiteLink?: string;

  @Prop({ type: String, required: true })
  securityStamp: string;

  @Prop({ type: String })
  photoUrl?: string;

  @Prop({ type: String })
  coverUrl?: string;

  @Prop({ type: Number })
  themeSource?: number;

  @Prop({ type: String })
  themeStyle?: string;

  @Prop({ type: [Types.ObjectId], ref: 'UserRole', default: [] })
  userRoles: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'UserLogins' })
  userLogins: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'RefreshToken' })
  refreshTokens: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'VerificationToken' })
  verificationTokens: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Relationship' })
  followers: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Relationship' })
  followees: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'RoomMember' })
  roomMembers: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'RoomMessage' })
  roomMessages: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Buzz' })
  buzzes: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'BuzzReaction' })
  buzzReactions: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Notification' })
  notificationSource: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Notification' })
  notificationTarget: Types.ObjectId[];

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  // Virtual field example
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // Method to validate password
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Adding the virtual field to the schema
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});
