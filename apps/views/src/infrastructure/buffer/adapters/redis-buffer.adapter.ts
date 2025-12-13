import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import Redis from 'ioredis';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import {
  ViewsBufferPort,
  VIEWS_REPOSITORY_PORT,
  ViewRepositoryPort,
} from '@views/application/ports';
import { ViewAggregate } from '@views/domain/aggregates';
import { AppConfigService } from '@views/infrastructure/config';

import { ViewMessage, StreamData } from '../types';

@Injectable()
export class RedisStreamBufferAdapter implements OnModuleInit, ViewsBufferPort {
  private redisClient: Redis;

  public constructor(
    private readonly configService: AppConfigService,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(VIEWS_REPOSITORY_PORT)
    private readonly viewsRepo: ViewRepositoryPort,
  ) {
    this.redisClient = new Redis({
      host: configService.CACHE_HOST,
      port: configService.CACHE_PORT,
    });

    this.redisClient.on('connecting', () => {
      this.logger.info(`⏳ Redis connecting...`);
    });

    this.redisClient.on('connect', () => {
      this.logger.info('✅ Redis connected');
    });

    this.redisClient.on('error', (error) => {
      this.logger.info('❌ Error occured while connecting to redis', error);
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

  public async bufferView(like: ViewAggregate): Promise<void> {
    await this.redisClient.xadd(
      this.configService.BUFFER_KEY,
      '*',
      'like-message',
      JSON.stringify(like.getEntity().getSnapshot()),
    );
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async processViewsBatch() {
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
    const messages: ViewMessage[] = [];
    const ids: string[] = [];
    for (const [streamKey, entities] of stream) {
      this.logger.info(`Processing stream: ${streamKey}`);
      for (const [id, message] of entities) {
        this.logger.info(`Recieved an element with id:${id}`);
        ids.push(id);
        messages.push(JSON.parse(message[1]) as ViewMessage);
      }
    }
    return { ids: ids, extractedMessages: messages };
  }

  public async processMessages(ids: string[], messages: ViewMessage[]) {
    const models = messages.map((message) => {
      return ViewAggregate.create(message.userId, message.videoId);
    });

    const processedMessagesNumber = await this.viewsRepo.saveMany(models);

    await this.redisClient.xack(
      this.configService.BUFFER_KEY,
      this.configService.BUFFER_GROUPNAME,
      ...ids,
    );

    return processedMessagesNumber;
  }
}
