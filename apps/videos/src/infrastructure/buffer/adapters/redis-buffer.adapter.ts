import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import {
  VideosBufferPort,
  VIDEOS_RESPOSITORY_PORT,
  VideoRepositoryPort,
} from '@videos/application/ports';
import { VideoAggregate } from '@videos/domain/aggregates';
import { AppConfigService } from '@videos/infrastructure/config';
import { VideoRedisClient } from '@videos/infrastructure/clients/redis';

import { VideoMessage, StreamData } from '../types';

@Injectable()
export class RedisStreamBufferAdapter implements VideosBufferPort {
  public constructor(
    private readonly configService: AppConfigService,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(VIDEOS_RESPOSITORY_PORT)
    private readonly videosRepository: VideoRepositoryPort,
    private readonly redisBufferClient: VideoRedisClient,
  ) {}

  public async bufferVideo(video: VideoAggregate): Promise<void> {
    await this.redisBufferClient.redisClient.xadd(
      this.configService.BUFFER_KEY,
      '*',
      'like-message',
      JSON.stringify(video.getSnapshot()),
    );
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async processVideosBatch() {
    this.logger.alert(`Processing videos in batches now`);

    const streamData = (await this.redisBufferClient.redisClient.xreadgroup(
      'GROUP',
      this.configService.BUFFER_GROUPNAME,
      this.configService.BUFFER_REDIS_CONSUMER_ID,
      'COUNT',
      10,
      'BLOCK',
      5000,
      'STREAMS',
      this.configService.BUFFER_KEY,
      '>',
    )) as StreamData[];

    if (!streamData || streamData.length === 0) {
      return 0;
    }

    const { ids, extractedMessages } = this.extractMessageFromStream(streamData);

    return await this.processMessages(ids, extractedMessages);
  }

  public extractMessageFromStream(stream: StreamData[]) {
    const messages: VideoMessage[] = [];
    const ids: string[] = [];
    for (const [streamKey, entities] of stream) {
      this.logger.info(`Processing stream: ${streamKey}`);
      for (const [id, message] of entities) {
        this.logger.info(`Recieved an element with id:${id}`);
        ids.push(id);
        messages.push(JSON.parse(message[1]) as VideoMessage);
      }
    }
    return { ids: ids, extractedMessages: messages };
  }

  public async processMessages(ids: string[], messages: VideoMessage[]) {
    const models = messages.map((message) => {
      return VideoAggregate.create({
        id: message.id,
        ownerId: message.ownerId,
        channelId: message.channelId,
        title: message.title,
        videoThumbnailIdentifier: message.videoThumbnailIdentifier,
        videoFileIdentifier: message.videoFileIdentifier,
        categories: message.videoCategories,
        publishStatus: message.publishStatus,
        visibilityStatus: message.visibilityStatus,
        description: message.description,
      });
    });

    const processedMessagesNumber = await this.videosRepository.saveManyVideos(models);

    await this.redisBufferClient.redisClient.xack(
      this.configService.BUFFER_KEY,
      this.configService.BUFFER_GROUPNAME,
      ...ids,
    );

    return processedMessagesNumber;
  }
}
