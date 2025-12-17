import { EventBus } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';

import { UserProfileCreatedEventDto } from '@app/contracts/users';
import { VideoUploadedEventDto } from '@app/contracts/videos';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { ChannelCreatedEventDto } from '@app/contracts/channel';

import {
  ChannelCreatedEvent,
  UserProfileCreatedProjectionEvent,
  VideoUploadedProjectionEvent,
} from '@projection/application/events';

@Injectable()
export class KafkaService {
  constructor(
    private readonly eventBus: EventBus,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public onVideoUploadedProjectionEvent(message: VideoUploadedEventDto) {
    this.eventBus.publish<VideoUploadedProjectionEvent>(new VideoUploadedProjectionEvent(message));
  }

  public onUserProfileCreatedProjectionEvent(message: UserProfileCreatedEventDto) {
    this.logger.info(`Projecting user to projection database`, message);
    this.eventBus.publish<UserProfileCreatedProjectionEvent>(
      new UserProfileCreatedProjectionEvent(message),
    );
  }

  public onChannelCreatedProjectionEvent(message: ChannelCreatedEventDto) {
    this.logger.info(`Projecting channel to projection database`, message);
    this.eventBus.publish<ChannelCreatedEvent>(new ChannelCreatedEvent(message));
  }
}
