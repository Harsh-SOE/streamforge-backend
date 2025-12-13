import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, EachBatchPayload, Kafka, Producer } from 'kafkajs';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { CommentMessage } from '@app/common/types';

import {
  CommentBufferPort,
  COMMENTS_REPOSITORY_PORT,
  CommentRepositoryPort,
} from '@comments/application/ports';
import { CommentAggregate } from '@comments/domain/aggregates';
import { AppConfigService } from '@comments/infrastructure/config';

export const COMMENT_BUFFER_TOPIC = 'comment';

@Injectable()
export class KafkaBufferAdapter implements OnModuleInit, OnModuleDestroy, CommentBufferPort {
  private kafkaClient: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  public constructor(
    private readonly configService: AppConfigService,
    @Inject(COMMENTS_REPOSITORY_PORT)
    private readonly commentsRepo: CommentRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {
    this.kafkaClient = new Kafka({
      brokers: [`${configService.MESSAGE_BROKER_HOST}:${configService.MESSAGE_BROKER_PORT}`],
      clientId: this.configService.BUFFER_CLIENT_ID,
    });

    this.producer = this.kafkaClient.producer();

    this.consumer = this.kafkaClient.consumer({
      groupId: this.configService.BUFFER_KAFKA_CONSUMER_ID,
      maxWaitTimeInMs: this.configService.BUFFER_FLUSH_MAX_WAIT_TIME_MS,
      maxBytesPerPartition: 512_000,
      sessionTimeout: 30_000,
      heartbeatInterval: 3_000,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });
  }

  public async onModuleInit() {
    await this.producer.connect();
    await this.consumer.connect();

    await this.consumer.subscribe({
      topic: COMMENT_BUFFER_TOPIC,
      fromBeginning: false,
    });
  }

  public async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  public async bufferComment(comment: CommentAggregate): Promise<void> {
    await this.producer.send({
      topic: COMMENT_BUFFER_TOPIC,
      messages: [{ value: JSON.stringify(comment.getSnapshot()) }],
    });
  }

  public async processCommentsBatch(): Promise<number | void> {
    await this.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;
        const messages = batch.messages
          .filter((message) => message.value)
          .map((message) => JSON.parse(message.value!.toString()) as CommentMessage);

        const models = messages.map((message) =>
          CommentAggregate.create(message.userId, message.videoId, message.commentText),
        );

        this.logger.info(`Saving ${models.length} comments in database`);

        await this.commentsRepo.saveMany(models);

        this.logger.info(`${models.length} comments saved in database`);
      },
    });
  }
}
