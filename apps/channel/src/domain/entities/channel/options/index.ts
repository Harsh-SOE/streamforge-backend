import {
  ChannelBio,
  ChannelCoverImage,
  ChannelId,
  ChannelUserId,
} from '@channel/domain/value-objects';

export interface ChannelEntityOptions {
  readonly id: ChannelId;
  readonly userId: ChannelUserId;
  bio: ChannelBio;
  coverImage?: ChannelCoverImage;
  isChannelVerified: boolean;
  isChannelMonitized: boolean;
}

export interface ChannelEntityCreateOptions {
  id?: string;
  userId: string;
  bio?: string;
  coverImage?: string;
  isChannelVerified?: boolean;
  isChannelMonitized?: boolean;
}
