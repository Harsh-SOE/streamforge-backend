import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import {
  VIDEO_PROJECTION_REPOSITORY_PORT,
  VideoProjectionRepositoryPort,
} from '@projection/application/ports';

import { VideoUploadedProjectionEvent } from './video-uploaded.event';

@EventsHandler(VideoUploadedProjectionEvent)
export class VideoUploadedProjectionHandler implements IEventHandler<VideoUploadedProjectionEvent> {
  constructor(
    @Inject(VIDEO_PROJECTION_REPOSITORY_PORT)
    private readonly videoCardRepository: VideoProjectionRepositoryPort,
  ) {}

  async handle({ videoUploadedEvent }: VideoUploadedProjectionEvent) {
    await this.videoCardRepository.saveVideo(videoUploadedEvent);
  }
}
