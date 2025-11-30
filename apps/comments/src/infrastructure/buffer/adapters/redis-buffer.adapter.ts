import { Cron, CronExpression } from '@nestjs/schedule';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { CommentMessage, StreamData } from '@app/common/types';

import {
  CommentBufferPort,
  COMMENTS_REPOSITORY_PORT,
  CommentRepositoryPort,
} from '@comments/application/ports';
import { CommentAggregate } from '@comments/domain/aggregates';
import { AppConfigService } from '@comments/infrastructure/config';

@Injectable()
export class RedisStreamBufferAdapter
  implements CommentBufferPort, OnModuleInit
{
  private redisClient: Redis;

  public constructor(
    private readonly configService: AppConfigService,
    @Inject(COMMENTS_REPOSITORY_PORT)
    private readonly commentsRepo: CommentRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
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

  public async bufferComment(comment: CommentAggregate): Promise<void> {
    await this.redisClient.xadd(
      this.configService.BUFFER_KEY,
      '*',
      'comment-message',
      JSON.stringify(comment.getComment().getSnapshot()),
    );
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async processCommentsBatch() {
    this.logger.info(`Processing batches of comments now...`);

    const streamData = (await this.redisClient.xreadgroup(
      'GROUP',
      this.configService.BUFFER_GROUPNAME,
      'comment-consumer',
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

    const { ids, extractedMessages } =
      this.extractMessageFromStream(streamData);

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
      CommentAggregate.create(
        message.userId,
        message.videoId,
        message.commentText,
      ),
    );
    const processedMessagesNumber = await this.commentsRepo.saveMany(models);

    await this.redisClient.xack(
      this.configService.BUFFER_KEY,
      this.configService.BUFFER_GROUPNAME,
      ...ids,
    );

    return processedMessagesNumber;
  }
}
