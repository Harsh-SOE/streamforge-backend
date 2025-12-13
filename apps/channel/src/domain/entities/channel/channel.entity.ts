import { Injectable } from '@nestjs/common';

import { ChannelBio, ChannelCoverImage, ChannelUserId } from '@channel/domain/value-objects';

@Injectable()
export class ChannelEntity {
  public constructor(
    private readonly id: string,
    private readonly userId: ChannelUserId,
    private bio: ChannelBio,
    private coverImage?: ChannelCoverImage,
    private isChannelVerified?: boolean,
    private isChannelMonitized?: boolean,
  ) {}

  public getId() {
    return this.id;
  }

  public getUserId() {
    return this.userId;
  }

  public getBio() {
    return this.bio;
  }

  public getCoverImage() {
    return this.coverImage;
  }

  public getIsChannelVerified() {
    return this.isChannelVerified;
  }

  public getIsChannelMonitized() {
    return this.isChannelMonitized;
  }

  public getChannelSnapshot() {
    return {
      id: this.id,
      userId: this.userId.getValue(),
      bio: this.bio.getValue(),
      coverImage: this.coverImage?.getValue(),
      isChannelMonitized: this.isChannelMonitized,
      isChannelVerified: this.isChannelVerified,
    };
  }

  public static create(
    id: string,
    userId: string,
    bio?: string,
    coverImage?: string,
    isChannelVerified?: boolean,
    isChannelMonitized?: boolean,
  ): ChannelEntity {
    return new ChannelEntity(
      id,
      ChannelUserId.create(userId),
      ChannelBio.create(bio),
      ChannelCoverImage.create(coverImage),
      isChannelVerified,
      isChannelMonitized,
    );
  }

  public updateChannelBio(bio?: string) {
    this.bio = ChannelBio.create(bio);
    return;
  }

  public updateChannelCoverImage(coverImage?: string) {
    this.coverImage = ChannelCoverImage.create(coverImage);
    return;
  }

  public monitizeChannel() {
    this.isChannelMonitized = true;
  }

  public demonitizeChannel() {
    this.isChannelMonitized = false;
  }

  public verifyChannel() {
    this.isChannelVerified = true;
  }
}
