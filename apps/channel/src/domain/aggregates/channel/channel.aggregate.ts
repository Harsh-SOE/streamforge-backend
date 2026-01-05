import { Injectable } from '@nestjs/common';
import { AggregateRoot } from '@nestjs/cqrs';

import {
  ChannelCreatedDomainEvent,
  ChannelMonitizedDomainEvent,
  ChannelUpdatedDomainEvent,
} from '@channel/domain/domain-events';
import { ChannelEntity } from '@channel/domain/entities';

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

    const channelSnapshot = channelAggregate.getChannelSnapshot();

    channelAggregate.apply(
      new ChannelCreatedDomainEvent(
        channelSnapshot.id,
        channelSnapshot.userId,
        channelSnapshot.isChannelMonitized,
        channelSnapshot.isChannelVerified,
        channelSnapshot.bio,
        channelSnapshot.coverImage,
      ),
    );

    return channelAggregate;
  }

  public updateChannelDetails(data: ChannelUpdateOptions) {
    const { bio, coverImage } = data;
    const channelEntity = this.getChannelEntity();

    channelEntity.updateChannelBio(bio);
    channelEntity.updateChannelCoverImage(coverImage);

    const channelSnapshot = channelEntity.getChannelSnapshot();
    const { id, isChannelMonitized, isChannelVerified, userId } = channelSnapshot;

    this.apply(
      new ChannelUpdatedDomainEvent(
        id,
        userId,
        isChannelMonitized,
        isChannelVerified,
        bio,
        coverImage,
      ),
    );
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
    const { id, isChannelMonitized } = channelEntity.getChannelSnapshot();
    this.apply(new ChannelMonitizedDomainEvent(id, isChannelMonitized));
  }
}
