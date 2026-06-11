import { firstValueFrom } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
import { Inject, Injectable, NotImplementedException, OnModuleInit } from '@nestjs/common';

import { SERVICES } from '@app/common';
import { UserAuthPayload } from '@app/common/dtos';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { VIDEO_SERVICE_NAME, VideoServiceClient } from '@app/contracts/protocols/videos';
import { CHANNEL_SERVICE_NAME, ChannelServiceClient } from '@app/contracts/protocols/channel';
import { READ_QUERY_SERVICE_NAME, ReadQueryServiceClient } from '@app/contracts/protocols/read';

import { VideoDraftSavedRequestResponse, UpdatedVideoRequestResponse } from './response';
import { SaveVideoDraftRequestDto, UpdateVideoRequestDto } from './request';
import { VideoUploadVerifiedRequestResponse } from './response/video-upload-verified-request.response';

@Injectable()
export class VideoService implements OnModuleInit {
  private videoService: VideoServiceClient;
  private channelService: ChannelServiceClient;
  private queryService: ReadQueryServiceClient;

  constructor(
    @Inject(SERVICES.VIDEO) private readonly videoClient: ClientGrpc,
    @Inject(SERVICES.CHANNEL) private readonly channelClient: ClientGrpc,
    @Inject(SERVICES.READ) private readonly queryClient: ClientGrpc,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  onModuleInit() {
    this.videoService = this.videoClient.getService(VIDEO_SERVICE_NAME);
    this.channelService = this.channelClient.getService(CHANNEL_SERVICE_NAME);
    this.queryService = this.queryClient.getService(READ_QUERY_SERVICE_NAME);
  }

  async createVideoDraft(
    video: SaveVideoDraftRequestDto,
    user: UserAuthPayload,
  ): Promise<VideoDraftSavedRequestResponse> {
    const channel$ = this.queryService.getChannelFromUserId({
      userId: user.id,
    });

    const foundChannel = await firstValueFrom(channel$);
    if (!foundChannel || !foundChannel.channel) {
      this.logger.info(`No channel was found`);
      throw new Error(`Channel not found`);
    }

    const response$ = this.videoService.saveDraft({
      userId: user.id,
      channelId: foundChannel.channel.channelId,
      ...video,
    });
    const response = await firstValueFrom(response$);

    return {
      videoId: response.id,
      presignedFileIndentifier: response.fileIdentifier,
      presignedThumbnailIndentifier: response.thumbnailIdentifier,
    };
  }

  async verifyVideoUpload(videoId: string): Promise<VideoUploadVerifiedRequestResponse> {
    await new Promise(() => {});
    throw new NotImplementedException(
      `Implement 'verifyVideoUpload' method first to verify upload status for ${videoId}`,
    );
  }

  async updateOneVideo(
    updateVideoDto: UpdateVideoRequestDto,
    videoId: string,
  ): Promise<UpdatedVideoRequestResponse> {
    const response$ = this.videoService.update({
      id: videoId,
      ...updateVideoDto,
    });
    return await firstValueFrom(response$);
  }
}
