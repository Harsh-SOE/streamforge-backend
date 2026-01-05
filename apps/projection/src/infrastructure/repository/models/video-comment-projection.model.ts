import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class VideoCommentProjectionModel extends Document {
  @Prop({ type: String, index: true, unique: true })
  commentId: string;

  @Prop({ type: String, index: true, unique: true })
  userId: string;

  @Prop({ type: String, index: true, unique: true })
  videoId: string;

  @Prop()
  content: string;
}

export const VideoCommentProjectionSchema = SchemaFactory.createForClass(
  VideoCommentProjectionModel,
);
