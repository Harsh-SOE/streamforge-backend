import { Injectable } from '@nestjs/common';

import {
  ChannelBio,
  ChannelCoverImage,
  ChannelId,
  ChannelUserId,
} from '@channel/domain/value-objects';

import { ChannelEntityCreateOptions, ChannelEntityOptions } from './options';

@Injectable()
export class ChannelEntity {
  private constructor(private readonly valueObjects: ChannelEntityOptions) {}

  public static create(channelEntityCreateOptions: ChannelEntityCreateOptions): ChannelEntity {
    const { id, userId, bio, coverImage, isChannelMonitized, isChannelVerified } =
      channelEntityCreateOptions;

    return new ChannelEntity({
      id: ChannelId.create(id),
      bio: ChannelBio.create(bio),
      userId: ChannelUserId.create(userId),
      coverImage: ChannelCoverImage.create(coverImage),
      isChannelMonitized: isChannelMonitized ?? false,
      isChannelVerified: isChannelVerified ?? false,
    });
  }

  public getId() {
    return this.valueObjects.id;
  }

  public getUserId() {
    return this.valueObjects.userId;
  }

  public getBio() {
    return this.valueObjects.bio;
  }

  public getCoverImage() {
    return this.valueObjects.coverImage;
  }

  public getIsChannelVerified() {
    return this.valueObjects.isChannelVerified;
  }

  public getIsChannelMonitized() {
    return this.valueObjects.isChannelMonitized;
  }

  public getChannelSnapshot() {
    return {
      id: this.valueObjects.id.getValue(),
      userId: this.valueObjects.userId.getValue(),
      bio: this.valueObjects.bio.getValue(),
      coverImage: this.valueObjects.coverImage?.getValue(),
      isChannelMonitized: this.valueObjects.isChannelMonitized,
      isChannelVerified: this.valueObjects.isChannelVerified,
    };
  }

  public updateChannelBio(bio?: string) {
    this.valueObjects.bio = ChannelBio.create(bio);
    return;
  }

  public updateChannelCoverImage(coverImage?: string) {
    this.valueObjects.coverImage = ChannelCoverImage.create(coverImage);
    return;
  }

  public monitizeChannel() {
    this.valueObjects.isChannelMonitized = true;
  }

  public demonitizeChannel() {
    this.valueObjects.isChannelMonitized = false;
  }

  public verifyChannel() {
    this.valueObjects.isChannelVerified = true;
  }
}
