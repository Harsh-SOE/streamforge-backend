import { EachBatchPayload, KafkaMessage } from 'kafkajs';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { BUFFER_EVENTS } from '@app/clients';
import { KafkaClient } from '@app/clients/kafka';
import { CommentMessage } from '@app/common/types';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import {
  CommentBufferPort,
  COMMENTS_REPOSITORY_PORT,
  CommentRepositoryPort,
} from '@comments/application/ports';
import { CommentAggregate } from '@comments/domain/aggregates';

@Injectable()
export class KafkaBufferAdapter implements OnModuleInit, CommentBufferPort {
  public constructor(
    @Inject(COMMENTS_REPOSITORY_PORT)
    private readonly commentsRepo: CommentRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private readonly kafka: KafkaClient,
  ) {}

  public async onModuleInit() {
    await this.kafka.consumer.subscribe({
      topic: BUFFER_EVENTS.COMMENT_BUFFER_EVENT,
      fromBeginning: false,
    });

    await this.kafka.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;

        if (batch.topic !== BUFFER_EVENTS.COMMENT_BUFFER_EVENT.toString()) {
          return;
        }

        await this.processCommentMessages(batch.messages);
      },
    });
  }

  public async bufferComment(comment: CommentAggregate): Promise<void> {
    await this.kafka.producer.send({
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
