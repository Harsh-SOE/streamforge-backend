import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { VIDEO_TRANSCODER_EVENTS } from '@app/clients';
import { MESSAGE_BROKER, MessageBrokerPort } from '@app/ports/message-broker';

import { VideoCreatedEvent } from './video-created.event';

@EventsHandler(VideoCreatedEvent)
export class VideoCreatedEventHandler implements IEventHandler<VideoCreatedEvent> {
  constructor(@Inject(MESSAGE_BROKER) private messaageBroker: MessageBrokerPort) {}

  public async handle({ transcodeVideoMessage }: VideoCreatedEvent) {
    await this.messaageBroker.publishMessage(
      VIDEO_TRANSCODER_EVENTS.VIDEO_TRANSCODE_EVENT,
      JSON.stringify(transcodeVideoMessage),
    );
  }
}
