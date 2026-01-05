import Redis from 'ioredis';
import { Inject, Injectable, OnModuleDestroy, OnModuleInit, Optional } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { RedisClient } from '@app/clients/redis';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { RedisBufferHandler } from '@app/handlers/buffer/redis';

import {
  ViewsBufferPort,
  VIEWS_REPOSITORY_PORT,
  ViewRepositoryPort,
} from '@views/application/ports';
import { ViewAggregate } from '@views/domain/aggregates';
import { ViewsConfigService } from '@views/infrastructure/config';

import { ViewMessage, StreamData } from '../types';

export interface StreamConfig {
  key: string;
  groupName: string;
}

export const REDIS_STREAM_CONFIG = Symbol('REDIS_STREAM_CONFIG');

@Injectable()
export class RedisStreamBufferAdapter implements OnModuleInit, OnModuleDestroy, ViewsBufferPort {
  private readonly client: Redis;

  public constructor(
    private readonly configService: ViewsConfigService,

    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(VIEWS_REPOSITORY_PORT)
    private readonly viewsRepo: ViewRepositoryPort,

    private readonly redis: RedisClient,
    private readonly handler: RedisBufferHandler,

    @Optional()
    @Inject(REDIS_STREAM_CONFIG)
    private readonly streamConfig?: StreamConfig,
  ) {}

  public async connect(): Promise<void> {
    await this.client.connect();
  }

  public async disconnect(): Promise<void> {
    await this.client.quit();
  }

  public async createStream() {
    if (!this.streamConfig) return;
    try {
      await this.client.xgroup(
        'CREATE',
        this.streamConfig.key,
        this.streamConfig.groupName,
        '0',
        'MKSTREAM',
      );

      this.logger.info(`Stream with key:${this.streamConfig.key} was created successfully`);
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('BUSYGROUP')) {
        this.logger.alert(
          `Stream with key: ${this.streamConfig.key} already exists, skipping creation`,
        );
      } else {
        throw err;
      }
    }
  }

  public async onModuleInit() {
    await this.handler.execute(async () => await this.connect(), { operationType: 'CONNECT' });
    await this.handler.execute(async () => await this.createStream(), { operationType: 'CONNECT' });
  }

  public async onModuleDestroy() {
    await this.handler.execute(async () => await this.disconnect(), {
      operationType: 'DISCONNECT',
    });
  }

  public async bufferView(like: ViewAggregate): Promise<void> {
    await this.handler.execute(
      async () =>
        await this.client.xadd(
          this.configService.REDIS_STREAM_KEY,
          '*',
          'like-message',
          JSON.stringify(like.getEntity().getSnapshot()),
        ),
      {
        operationType: 'SAVE',
        valueToBuffer: JSON.stringify(like.getEntity().getSnapshot()),
      },
    );
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async processViewsBatch() {
    const getStreamDataOperation = async () =>
      (await this.client.xreadgroup(
        'GROUP',
        this.configService.REDIS_STREAM_GROUPNAME,
        this.configService.REDIS_STREAM_CONSUMER_ID,
        'COUNT',
        10,
        'BLOCK',
        5000,
        'STREAMS',
        this.configService.REDIS_STREAM_KEY,
        '>',
      )) as StreamData[];

    const streamData = await getStreamDataOperation();

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
      return ViewAggregate.create({ userId: message.userId, videoId: message.videoId });
    });

    const processedMessagesNumber = await this.viewsRepo.saveMany(models);

    await this.handler.execute(
      async () =>
        await this.client.xack(
          this.configService.REDIS_STREAM_KEY,
          this.configService.REDIS_STREAM_GROUPNAME,
          ...ids,
        ),
      {
        operationType: 'FLUSH',
      },
    );

    return processedMessagesNumber;
  }
}
