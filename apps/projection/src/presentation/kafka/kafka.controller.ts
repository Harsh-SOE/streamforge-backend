import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { VideoUploadedEventDto } from '@app/contracts/videos';
import { UserProfileCreatedEventDto } from '@app/contracts/users';
import { ChannelCreatedEventDto } from '@app/contracts/channel';
import { CHANNEL_EVENTS, USERS_EVENTS, VIDEO_EVENTS } from '@app/clients';

import { KafkaService } from './kafka.service';

@Controller('projection')
export class KafkaController {
  public constructor(private readonly kafkaService: KafkaService) {}

  @EventPattern(VIDEO_EVENTS.VIDEO_PUBLISHED_EVENT)
  public onVideoUploadedProjectionEvent(@Payload() message: VideoUploadedEventDto) {
    this.kafkaService.onVideoUploadedProjectionEvent(message);
  }

  @EventPattern(USERS_EVENTS.USER_ONBOARDED_EVENT)
  public onUserProfileCreatedProjectionEvent(@Payload() message: UserProfileCreatedEventDto) {
    this.kafkaService.onUserProfileCreatedProjectionEvent(message);
  }

  @EventPattern(CHANNEL_EVENTS.CHANNEEL_CREATED)
  public onChannelCreatedProjectionEvent(@Payload() message: ChannelCreatedEventDto) {
    this.kafkaService.onChannelCreatedProjectionEvent(message);
  }
}
