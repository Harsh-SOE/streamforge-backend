import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ProjectedCommentsForVideoModel extends Document {
  @Prop({ type: String, index: true, unique: true })
  commentId: string;

  @Prop({ type: String, index: true, unique: true })
  userId: string;

  @Prop({ type: String, index: true, unique: true })
  videoId: string;

  @Prop()
  handle: string;

  @Prop()
  userAvatar: string;

  @Prop()
  content: string;
}

export const ProjectedCommentsForVideoSchema = SchemaFactory.createForClass(
  ProjectedCommentsForVideoModel,
);
