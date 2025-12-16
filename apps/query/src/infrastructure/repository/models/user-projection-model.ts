import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ProjectedUserQueryModel extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, index: true })
  userAuthId: string;

  @Prop()
  userName: string;

  @Prop()
  avatar: string;

  @Prop({ type: Boolean, default: false })
  hasChannel: boolean;

  @Prop({ index: true })
  handle: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ type: Boolean, default: false })
  isPhoneNumberVerified: boolean;

  @Prop()
  dob?: string;
}

export const ProjectUserQuerySchema = SchemaFactory.createForClass(ProjectedUserQueryModel);
