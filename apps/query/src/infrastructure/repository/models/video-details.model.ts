import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ProjectVideoDetailsModel extends Document {
  @Prop({ required: true, unique: true, index: true })
  videoId: string;

  @Prop({ index: true })
  ownerId: string;

  @Prop({ index: true })
  channelId: string;

  @Prop()
  ownerName: string;

  @Prop()
  ownerAvatar: string;

  @Prop({ default: 0 })
  ownerSubscribers: number;

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

export const ProjectedVideoDetailsSchema = SchemaFactory.createForClass(
  ProjectVideoDetailsModel,
);
