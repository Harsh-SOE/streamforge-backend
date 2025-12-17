import { AggregateRoot } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';

import { ChannelEntity } from '@channel/domain/entities';
import { ChannelMonitizedEvent, ChannelUpdatedEvent } from '@channel/application/events';

import { ChannelAggregateCreateOptions, ChannelUpdateOptions } from './options';

@Injectable()
export class ChannelAggregate extends AggregateRoot {
  private constructor(private readonly channelEntity: ChannelEntity) {
    super();
  }

  public getChannelEntity() {
    return this.channelEntity;
  }

  public getChannelSnapshot() {
    return this.channelEntity.getChannelSnapshot();
  }

  public static create(
    channelAggregateCreateOptions: ChannelAggregateCreateOptions,
  ): ChannelAggregate {
    const { id, userId, bio, coverImage, isChannelMonitized, isChannelVerified } =
      channelAggregateCreateOptions;

    const channelEntity = ChannelEntity.create({
      id,
      userId,
      bio,
      coverImage,
      isChannelVerified,
      isChannelMonitized,
    });
    const channelAggregate = new ChannelAggregate(channelEntity);

    return channelAggregate;
  }

  public updateChannelDetails(data: ChannelUpdateOptions) {
    const { bio, coverImage } = data;
    const channelEntity = this.getChannelEntity();

    channelEntity.updateChannelBio(bio);
    channelEntity.updateChannelCoverImage(coverImage);

    this.apply(new ChannelUpdatedEvent(this));
  }

  public updateChannelVerificationStatus() {
    this.channelEntity.verifyChannel();
  }

  public updateChannelMonitizedStatus(newStatus: boolean) {
    const channelEntity = this.getChannelEntity();

    if (newStatus) {
      channelEntity.monitizeChannel();
      return;
    }
    channelEntity.demonitizeChannel();
    this.apply(new ChannelMonitizedEvent(this));
  }
}
