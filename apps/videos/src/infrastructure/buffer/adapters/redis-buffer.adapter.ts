import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import Redis from 'ioredis';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import {
  VideosBufferPort,
  VIDEOS_COMMAND_RESPOSITORY_PORT,
  VideoCommandRepositoryPort,
} from '@videos/application/ports';
import { VideoAggregate } from '@videos/domain/aggregates';
import { AppConfigService } from '@videos/infrastructure/config';

import { VideoMessage, StreamData } from '../types';

@Injectable()
export class RedisStreamBufferAdapter implements OnModuleInit, VideosBufferPort {
  private redisClient: Redis;

  public constructor(
    private readonly configService: AppConfigService,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(VIDEOS_COMMAND_RESPOSITORY_PORT)
    private readonly videosRepository: VideoCommandRepositoryPort,
  ) {
    this.redisClient = new Redis({
      host: configService.CACHE_HOST,
      port: configService.CACHE_PORT,
    });

    this.redisClient.on('connecting', () => {
      this.logger.info(`⏳ Redis buffer connecting...`);
    });

    this.redisClient.on('connect', () => {
      this.logger.info('✅ Redis buffer connected');
    });

    this.redisClient.on('error', (error) => {
      this.logger.info('❌ Error buffer occured while connecting to redis', error);
    });
  }

  public async onModuleInit() {
    try {
      await this.redisClient.xgroup(
        'CREATE',
        this.configService.BUFFER_KEY,
        this.configService.BUFFER_GROUPNAME,
        '0',
        'MKSTREAM',
      );
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('BUSYGROUP')) {
        console.warn(
          `Stream with key: ${this.configService.BUFFER_KEY} already exists, skipping creation`,
        );
      } else {
        throw err;
      }
    }
  }

  public async bufferVideo(video: VideoAggregate): Promise<void> {
    await this.redisClient.xadd(
      this.configService.BUFFER_KEY,
      '*',
      'like-message',
      JSON.stringify(video.getSnapshot()),
    );
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async processVideosBatch() {
    const streamData = (await this.redisClient.xreadgroup(
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

    const processedMessagesNumber = await this.videosRepository.saveMany(models);

    await this.redisClient.xack(
      this.configService.BUFFER_KEY,
      this.configService.BUFFER_GROUPNAME,
      ...ids,
    );

    return processedMessagesNumber;
  }
}
