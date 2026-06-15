import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export const VIDEO_READ_STATES = [
  'DRAFT',
  'UPLOADED',
  'PROCESSING',
  'READY_TO_PUBLISH',
  'PUBLISHED',
  'FAILED',
] as const;

export type VideoReadState = (typeof VIDEO_READ_STATES)[number];

export const VIDEO_VISIBILITY_STATES = ['PUBLIC', 'PRIVATE', 'UNLISTED'] as const;

export type VideoVisibilityState = (typeof VIDEO_VISIBILITY_STATES)[number];

@Schema({
  timestamps: true,
  collection: 'creator_video_read',
})
export class VideoCreatorReadModel {
  @Prop({ required: true, unique: true })
  videoId!: string;

  @Prop({ required: true, index: true })
  ownerId!: string;

  @Prop({ required: true, index: true })
  channelId!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: [String], default: [], index: true })
  categories!: string[];

  @Prop({
    required: true,
    enum: VIDEO_VISIBILITY_STATES,
    default: 'PRIVATE',
    index: true,
  })
  visibility!: VideoVisibilityState;

  @Prop({
    required: true,
    enum: VIDEO_READ_STATES,
    default: 'DRAFT',
    index: true,
  })
  state!: VideoReadState;

  @Prop()
  mimeType?: string;

  @Prop({ min: 0 })
  sizeBytes?: number;

  @Prop()
  videoFileIdentifier?: string;

  @Prop()
  thumbnailIdentifier?: string;

  @Prop()
  hlsManifestIdentifier?: string;

  @Prop()
  hlsBasePathIdentifier?: string;

  @Prop({ min: 0 })
  durationSeconds?: number;

  @Prop({ min: 0 })
  width?: number;

  @Prop({ min: 0 })
  height?: number;

  @Prop()
  failureReason?: string;

  @Prop()
  draftSavedAt?: Date;

  @Prop()
  uploadedAt?: Date;

  @Prop()
  processingCompletedAt?: Date;

  @Prop()
  publishedAt?: Date;

  @Prop()
  failedAt?: Date;

  @Prop({ default: 0, min: 0 })
  views!: number;

  @Prop({ default: 0, min: 0 })
  likes!: number;

  @Prop({ default: 0, min: 0 })
  dislikes!: number;

  @Prop({ default: 0, min: 0 })
  commentsCount!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CreatorVideoReadMongooseSchema = SchemaFactory.createForClass(VideoCreatorReadModel);

// Get creator's videos by state: drafts, processing, failed, published, etc.
CreatorVideoReadMongooseSchema.index({
  ownerId: 1,
  state: 1,
  updatedAt: -1,
});

// Get channel videos by state.
CreatorVideoReadMongooseSchema.index({
  channelId: 1,
  state: 1,
  updatedAt: -1,
});

// Creator's published videos sorted by publish time.
CreatorVideoReadMongooseSchema.index({
  ownerId: 1,
  publishedAt: -1,
});

// Channel's published videos sorted by publish time.
CreatorVideoReadMongooseSchema.index({
  channelId: 1,
  publishedAt: -1,
});

// Filter creator videos by visibility.
CreatorVideoReadMongooseSchema.index({
  ownerId: 1,
  visibility: 1,
  updatedAt: -1,
});

// Search inside creator dashboard.
CreatorVideoReadMongooseSchema.index({
  title: 'text',
  description: 'text',
});

export type CreatorVideoReadDocument = HydratedDocument<VideoCreatorReadModel>;
