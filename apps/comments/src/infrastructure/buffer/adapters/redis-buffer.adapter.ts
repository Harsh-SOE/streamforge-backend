import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { RedisClient } from '@app/clients/redis';
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
export class RedisStreamBufferAdapter implements CommentBufferPort {
  public constructor(
    private readonly configService: AppConfigService,
    @Inject(COMMENTS_REPOSITORY_PORT)
    private readonly commentsRepo: CommentRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private readonly redis: RedisClient,
  ) {}

  public async bufferComment(comment: CommentAggregate): Promise<void> {
    await this.redis.client.xadd(
      this.configService.REDIS_STREAM_KEY,
      '*',
      'comment-message',
      JSON.stringify(comment.getEntity().getSnapshot()),
    );
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async processCommentsMessages() {
    this.logger.info(`Processing batches of comments now...`);

    const streamData = (await this.redis.client.xreadgroup(
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

    await this.redis.client.xack(
      this.configService.REDIS_STREAM_KEY,
      this.configService.REDIS_STREAM_GROUPNAME,
      ...ids,
    );

    return processedMessagesNumber;
  }
}
