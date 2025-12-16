import { CommandBus } from '@nestjs/cqrs';
import { Inject, Injectable, NotImplementedException } from '@nestjs/common';

import {
  GetPresignedUrlDto,
  GetPreSignedUrlResponse,
  VideoCreateDto,
  VideoPublishedResponse,
  VideoUpdatedResponse,
  VideoUpdateDto,
} from '@app/contracts/videos';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { GeneratePreSignedUrlVideoCommand } from '@videos/application/commands/generate-presigned-url-video-command';
import { GeneratePreSignedUrlThumbnailCommand } from '@videos/application/commands/generate-presigned-url-thumbnail-command';
import { PublishVideoCommand } from '@videos/application/commands/publish-video-command';
import { UpdateVideoCommand } from '@videos/application/commands/update-video-command';

@Injectable()
export class RpcService {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  async generatePreSignedVideoUrl(
    getPresignedUrlDto: GetPresignedUrlDto,
  ): Promise<GetPreSignedUrlResponse> {
    const result = await this.commandBus.execute<
      GeneratePreSignedUrlVideoCommand,
      GetPreSignedUrlResponse
    >(new GeneratePreSignedUrlVideoCommand(getPresignedUrlDto));
    this.logger.info(`Result in video is: `, result);
    return result;
  }

  async generatePreSignedThumbnailUrl(
    getPresignedUrlDto: GetPresignedUrlDto,
  ): Promise<GetPreSignedUrlResponse> {
    const result = await this.commandBus.execute<
      GeneratePreSignedUrlVideoCommand,
      GetPreSignedUrlResponse
    >(new GeneratePreSignedUrlThumbnailCommand(getPresignedUrlDto));
    this.logger.info(`Result in video is: `, result);
    return result;
  }

  async create(videoCreateDto: VideoCreateDto): Promise<VideoPublishedResponse> {
    return await this.commandBus.execute<PublishVideoCommand, VideoPublishedResponse>(
      new PublishVideoCommand(videoCreateDto),
    );
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
