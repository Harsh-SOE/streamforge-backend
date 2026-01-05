import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class VideoDetailsProjectionModel extends Document {
  @Prop({ required: true, unique: true, index: true })
  videoId: string;

  @Prop({ index: true })
  userId: string;

  @Prop({ index: true })
  channelId: string;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [String], index: true })
  categories: string[];

  @Prop()
  visibility: string;

  @Prop({ index: true })
  publishedAt: Date;

  @Prop()
  videoUrl: string;

  @Prop()
  thumbnailUrl: string;

  @Prop()
  durationSeconds: number;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  dislikes: number;

  @Prop({ default: 0 })
  commentsCount: number;
}

export const VideoDetailsProjectionSchema = SchemaFactory.createForClass(
  VideoDetailsProjectionModel,
);
