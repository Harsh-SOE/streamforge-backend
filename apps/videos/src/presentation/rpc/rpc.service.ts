import { CommandBus } from '@nestjs/cqrs';
import { Inject, Injectable, NotImplementedException } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import {
  CheckUploadedVideoDto,
  SaveVideoDraftDto,
  UpdateVideoDto,
  VideoDraftSavedResponse,
  VideoUpdatedResponse,
  VideoUploadedVerifiedResponse,
} from '@app/contracts/protocols/videos';

import { UpdateVideoCommand } from '@videos/application/commands/update-video-command';
import { VideoSaveDraftCommand } from '@videos/application/commands/save-video-draft-command';
import { VerifyUploadedMediaCommand } from '@videos/application/commands/verify-uploaded-media-command';

@Injectable()
export class RpcService {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  async saveDraft(videoSaveDraftDto: SaveVideoDraftDto): Promise<VideoDraftSavedResponse> {
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
  ): Promise<VideoUploadedVerifiedResponse> {
    return await this.commandBus.execute<VerifyUploadedMediaCommand, VideoUploadedVerifiedResponse>(
      new VerifyUploadedMediaCommand(checkUploadedVideoDto),
    );
  }

  async update(videoUpdateDto: UpdateVideoDto): Promise<VideoUpdatedResponse> {
    return await this.commandBus.execute<UpdateVideoCommand, VideoUpdatedResponse>(
      new UpdateVideoCommand(videoUpdateDto),
    );
  }

  remove(id: string): Promise<boolean> {
    throw new NotImplementedException(`remove with id:${id} is not implemented`);
  }
}
