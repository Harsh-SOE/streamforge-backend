import { Consumer, EachBatchPayload, KafkaMessage, Producer } from 'kafkajs';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { Entity } from '@app/common';
import { KafkaClient } from '@app/clients/kafka';
import { BufferMessage } from '@app/common/buffer';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import {
  CommentBufferPort,
  COMMENTS_REPOSITORY_PORT,
  CommentRepositoryPort,
} from '@comments/application/ports';
import { CommentAggregate } from '@comments/domain/aggregates';

import { CommentBufferMessage } from '../types';
import { isCommentBufferMessage } from '../gaurds';

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
    // subscribe to buffer event
    await this.consumer.subscribe({
      topic: 'buffer',
      fromBeginning: false,
    });

    await this.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;

        // reject all messages that are not from buffer event (optional, as the consumer itself will subscribe to topic 'INTERNAL_BUFFER')
        if (batch.topic !== 'buffer') {
          return;
        }

        // process all comment buffer messages only...
        await this.processCommentMessages(this.getCommentBufferMessages(batch.messages));
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
    const commentPayload = comment.getSnapshot();

    const commentProjectionEvent = new CommentBufferMessage({
      commentId: commentPayload.id,
      commentText: commentPayload.commentText,
      userId: commentPayload.userId,
      videoId: commentPayload.videoId,
    });

    await this.producer.send({
      topic: 'buffer',
      messages: [{ value: JSON.stringify(commentProjectionEvent) }],
    });
  }

  private getCommentBufferMessages(messages: KafkaMessage[]): CommentBufferMessage[] {
    return messages
      .map((message) => JSON.parse(message.value!.toString()) as BufferMessage<Entity, any>)
      .filter(isCommentBufferMessage);
  }

  private async processCommentMessages(messages: CommentBufferMessage[]) {
    const payload = messages.map((message) => message.payload);

    const models = payload.map((payload) =>
      CommentAggregate.create({
        userId: payload.userId,
        videoId: payload.videoId,
        commentText: payload.commentText,
      }),
    );

    this.logger.info(`Saving ${models.length} comments in database`);

    await this.commentsRepo.saveMany(models);

    this.logger.info(`${models.length} comments saved in database`);
  }
}
