import { CommandBus } from '@nestjs/cqrs';
import { Inject, Injectable, NotImplementedException } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import {
  CheckUploadedVideoDto,
  CheckUploadedVideoResponse,
  VideoDraftSavedResponse,
  VideoSaveDraftDto,
  VideoUpdatedResponse,
  VideoUpdateDto,
} from '@app/contracts/protocols/videos';

import { UpdateVideoCommand } from '@videos/application/commands/update-video-command';
import { VideoSaveDraftCommand } from '@videos/application/commands/save-video-draft-command';

@Injectable()
export class RpcService {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  async saveDraft(videoSaveDraftDto: VideoSaveDraftDto): Promise<VideoDraftSavedResponse> {
    return await this.commandBus.execute<VideoSaveDraftCommand, VideoDraftSavedResponse>(
      new VideoSaveDraftCommand({
        userId: videoSaveDraftDto.userId,
        channelId: videoSaveDraftDto.channelId,
        categories: videoSaveDraftDto.categories,
        title: videoSaveDraftDto.title,
        description: videoSaveDraftDto.description,
      }),
    );
  }

  async verifyUploadedVideo(
    checkUploadedVideoDto: CheckUploadedVideoDto,
  ): Promise<CheckUploadedVideoResponse> {
    return new Promise((resolve) => {
      resolve({
        id: checkUploadedVideoDto.id,
        uploaded: true,
      });
    });
  }

  async update(videoUpdateDto: VideoUpdateDto): Promise<VideoUpdatedResponse> {
    return await this.commandBus.execute<UpdateVideoCommand, VideoUpdatedResponse>(
      new UpdateVideoCommand(videoUpdateDto),
    );
  }

  remove(id: string): Promise<boolean> {
    throw new NotImplementedException(`remove with id:${id} is not implemented`);
  }
}
