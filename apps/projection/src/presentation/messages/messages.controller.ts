import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { VideoUploadedEventDto } from '@app/contracts/videos';
import { UserProfileCreatedEventDto, UserProfileUpdatedEventDto } from '@app/contracts/users';
import { ChannelCreatedEventDto } from '@app/contracts/channel';
import { CHANNEL_EVENTS, USERS_EVENTS, VIDEO_EVENTS } from '@app/clients';

import { MessagesService } from './messages.service';

@Controller('projection')
export class MessagesController {
  public constructor(private readonly messageService: MessagesService) {}

  @EventPattern(USERS_EVENTS.USER_ONBOARDED_EVENT)
  public onUserProfileCreatedProjectionEvent(@Payload() message: UserProfileCreatedEventDto) {
    this.messageService.onUserProfileCreatedProjectionEvent(message);
  }

  @EventPattern(USERS_EVENTS.USER_PROFILE_UPDATED_EVENT)
  public onUserProfileUpdated(@Payload() message: UserProfileUpdatedEventDto) {
    this.messageService.onUserProfileUpdatedProjectionEvent(message);
  }

  @EventPattern(VIDEO_EVENTS.VIDEO_PUBLISHED_EVENT)
  public onVideoUploadedProjectionEvent(@Payload() message: VideoUploadedEventDto) {
    this.messageService.onVideoUploadedProjectionEvent(message);
  }

  @EventPattern(CHANNEL_EVENTS.CHANNEL_CREATED)
  public onChannelCreatedProjectionEvent(@Payload() message: ChannelCreatedEventDto) {
    this.messageService.onChannelCreatedProjectionEvent(message);
  }
}
