import { Consumer, EachBatchPayload, KafkaMessage, Producer } from 'kafkajs';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { KafkaClient } from '@app/clients/kafka';
import { BUFFER_EVENTS } from '@app/common/events';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import {
  CommentBufferPort,
  COMMENTS_REPOSITORY_PORT,
  CommentRepositoryPort,
} from '@comments/application/ports';
import { CommentAggregate } from '@comments/domain/aggregates';

import { CommentMessage } from '../types';

@Injectable()
export class KafkaBufferAdapter implements OnModuleInit, CommentBufferPort {
  private readonly consumer: Consumer;
  private readonly producer: Producer;

  public constructor(
    @Inject(COMMENTS_REPOSITORY_PORT)
    private readonly commentsRepo: CommentRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private readonly kafka: KafkaClient,
  ) {
    this.consumer = kafka.getConsumer({ groupId: 'comments', allowAutoTopicCreation: true });
    this.producer = kafka.getProducer({ allowAutoTopicCreation: true });
  }

  public async onModuleInit() {
    await this.consumer.subscribe({
      topic: BUFFER_EVENTS.COMMENT_BUFFER_EVENT,
      fromBeginning: false,
    });

    await this.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;

        if (batch.topic !== BUFFER_EVENTS.COMMENT_BUFFER_EVENT.toString()) {
          return;
        }

        await this.processCommentMessages(batch.messages);
      },
    });
  }

  public async connect(): Promise<void> {
    await this.producer.connect();
    await this.consumer.connect();
  }

  public async disconnect(): Promise<void> {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  public async bufferComment(comment: CommentAggregate): Promise<void> {
    await this.producer.send({
      topic: BUFFER_EVENTS.COMMENT_BUFFER_EVENT,
      messages: [{ value: JSON.stringify(comment.getSnapshot()) }],
    });
  }

  private async processCommentMessages(messages: KafkaMessage[]) {
    const commentMessages = messages
      .filter((message) => message.value)
      .map((message) => JSON.parse(message.value!.toString()) as CommentMessage);

    const models = commentMessages.map((message) =>
      CommentAggregate.create({
        userId: message.userId,
        videoId: message.videoId,
        commentText: message.commentText,
      }),
    );

    this.logger.info(`Saving ${models.length} comments in database`);

    await this.commentsRepo.saveMany(models);

    this.logger.info(`${models.length} comments saved in database`);
  }
}
