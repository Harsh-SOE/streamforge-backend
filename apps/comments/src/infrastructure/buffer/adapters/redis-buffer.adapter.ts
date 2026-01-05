import Redis from 'ioredis';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Inject, Injectable, OnModuleDestroy, OnModuleInit, Optional } from '@nestjs/common';

import { RedisClient } from '@app/clients/redis';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { RedisBufferHandler } from '@app/handlers/buffer/redis';

import {
  CommentBufferPort,
  COMMENTS_REPOSITORY_PORT,
  CommentRepositoryPort,
} from '@comments/application/ports';
import { CommentAggregate } from '@comments/domain/aggregates';
import { CommentsConfigService } from '@comments/infrastructure/config';

import { CommentMessage, StreamData } from '../types';

export interface RedisBufferConfig {
  key: string;
  groupName: string;
}

export const REDIS_BUFFER_CONFIG = Symbol('REDIS_BUFFER_CONFIG');

@Injectable()
export class RedisStreamBufferAdapter implements OnModuleInit, OnModuleDestroy, CommentBufferPort {
  private readonly client: Redis;

  public constructor(
    private readonly configService: CommentsConfigService,
    @Inject(COMMENTS_REPOSITORY_PORT)
    private readonly commentsRepo: CommentRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private readonly redis: RedisClient,
    private readonly handler: RedisBufferHandler,
    @Optional()
    @Inject(REDIS_BUFFER_CONFIG)
    private readonly streamConfig?: RedisBufferConfig,
  ) {
    this.client = redis.getClient();
  }

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
    await this.handler.execute(async () => await this.connect(), {
      operationType: 'CONNECT',
    });
    await this.handler.execute(async () => await this.createStream(), {
      operationType: 'CONNECT',
    });
  }

  public async onModuleDestroy() {
    await this.handler.execute(async () => await this.connect(), {
      operationType: 'DISCONNECT',
    });
  }

  public async bufferComment(comment: CommentAggregate): Promise<void> {
    const addElementToStream = async () =>
      await this.client.xadd(
        this.configService.REDIS_STREAM_KEY,
        '*',
        'comment-message',
        JSON.stringify(comment.getEntity().getSnapshot()),
      );
    await this.handler.execute(addElementToStream, {
      operationType: 'SAVE',
      valueToBuffer: JSON.stringify(comment.getEntity().getSnapshot()),
    });
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async processCommentsMessages() {
    this.logger.info(`Processing batches of comments now...`);

    const getStreamDataOperation = async () =>
      (await this.client.xreadgroup(
        'GROUP',
        this.configService.REDIS_STREAM_GROUPNAME,
        'comment-consumer',
        'COUNT',
        10,
        'BLOCK',
        5000,
        'STREAMS',
        this.configService.REDIS_STREAM_KEY,
        '>',
      )) as StreamData[];

    const streamData = await this.handler.execute(getStreamDataOperation, {
      operationType: 'FLUSH',
    });

    if (!streamData || streamData.length === 0) {
      return 0;
    }

    const { ids, extractedMessages } = this.extractMessageFromStream(streamData);

    return await this.processMessages(ids, extractedMessages);
  }

  public extractMessageFromStream(stream: StreamData[]) {
    const messages: CommentMessage[] = [];
    const ids: string[] = [];
    for (const [streamKey, entities] of stream) {
      this.logger.info(`Processing stream: ${streamKey}`);
      for (const [id, message] of entities) {
        this.logger.info(`Recieved an element with id:${id}`);
        ids.push(id);
        messages.push(JSON.parse(message[1]) as CommentMessage);
      }
    }
    return { ids: ids, extractedMessages: messages };
  }

  public async processMessages(ids: string[], messages: CommentMessage[]) {
    const models = messages.map((message) =>
      CommentAggregate.create({
        userId: message.userId,
        videoId: message.videoId,
        commentText: message.commentText,
      }),
    );
    const processedMessagesNumber = await this.commentsRepo.saveMany(models);

    const acknowledgeElementsOperations = async () =>
      await this.client.xack(
        this.configService.REDIS_STREAM_KEY,
        this.configService.REDIS_STREAM_GROUPNAME,
        ...ids,
      );

    await this.handler.execute(acknowledgeElementsOperations, {
      operationType: 'FLUSH',
    });

    return processedMessagesNumber;
  }
}
