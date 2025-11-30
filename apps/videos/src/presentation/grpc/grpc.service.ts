import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import {
  GetPresignedUrlDto,
  GetPreSignedUrlResponse,
  VideoCreateDto,
  VideoFindDto,
  VideoFindQueryDto,
  VideoFoundResponse,
  VideoPublishedResponse,
  VideosFoundResponse,
  VideoUpdatedResponse,
  VideoUpdateDto,
} from '@app/contracts/videos';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import {
  EditVideoCommand,
  PublishVideoCommand,
  GeneratePreSignedUrlVideoCommand,
  GeneratePreSignedUrlThumbnailCommand,
} from '@videos/application/commands';
import { FindVideoQuery } from '@videos/application/queries';
import { QueryVideo } from '@videos/application/queries/query-video/query-video.query';

@Injectable()
export class GrpcService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
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

  async create(
    videoCreateDto: VideoCreateDto,
  ): Promise<VideoPublishedResponse> {
    return await this.commandBus.execute<
      PublishVideoCommand,
      VideoPublishedResponse
    >(new PublishVideoCommand(videoCreateDto));
  }

  findAll(): Promise<VideosFoundResponse> {
    throw new NotImplementedException(`findAll is not implemented`);
  }

  findOne(videoFindDto: VideoFindDto): Promise<VideoFoundResponse> {
    return this.queryBus.execute<FindVideoQuery, VideoFoundResponse>(
      new FindVideoQuery(videoFindDto),
    );
  }

  findVideos(videoFindDto: VideoFindQueryDto): Promise<VideosFoundResponse> {
    return this.queryBus.execute<QueryVideo, VideosFoundResponse>(
      new QueryVideo(videoFindDto),
    );
  }

  async update(videoUpdateDto: VideoUpdateDto): Promise<VideoUpdatedResponse> {
    return await this.commandBus.execute<
      EditVideoCommand,
      VideoUpdatedResponse
    >(new EditVideoCommand(videoUpdateDto));
  }

  remove(id: string): Promise<boolean> {
    throw new NotImplementedException(
      `remove with id:${id} is not implemented`,
    );
  }
}
