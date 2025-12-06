import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ProjectedVideoCardModel extends Document {
  @Prop({ required: true, unique: true, index: true })
  videoId: string;

  @Prop({ required: true, index: true })
  ownerId: string;

  @Prop({ required: true, index: true })
  channelId: string;

  @Prop()
  ownerName: string;

  @Prop()
  ownerAvatar: string;

  @Prop({ index: true })
  ownerHandle: string;

  @Prop({ required: true })
  title: string;

  @Prop({ index: true })
  searchTitle?: string;

  @Prop()
  thumbnailUrl: string;

  @Prop()
  videoUrl: string;

  @Prop()
  durationSeconds: number;

  @Prop({ index: true })
  visibility: string;

  @Prop({ type: [String], index: true })
  categories: string[];

  @Prop({ index: true })
  publishedAt: Date;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  commentsCount: number;

  updatedAt: Date;
}

export const ProjectedVideoCardSchema = SchemaFactory.createForClass(
  ProjectedVideoCardModel,
);
