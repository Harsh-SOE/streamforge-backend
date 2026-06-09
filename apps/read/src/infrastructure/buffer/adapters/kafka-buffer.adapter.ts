// todo: remove user buffer message type and use user projection payload??
// todo: make a handler for kafka buffer handler
import { Consumer, EachBatchPayload, KafkaMessage, Producer } from 'kafkajs';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { Entity } from '@app/common';
import { KafkaClient } from '@app/clients/kafka';
import { BufferMessage } from '@app/common/buffer';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import {
  USER_PROJECTION_REPOSITORY_PORT,
  ProjectionBufferPort,
  UserProjectionRepositoryPort,
  VIDEO_PROJECTION_REPOSITORY_PORT,
  VideoProjectionRepositoryPort,
} from '@read/application/ports';
import {
  UserOnBoardedProjection,
  VideoPublishedProjection,
} from '@read/application/payload/projection';

import { UserProjectionBufferMessage, VideoProjectionBufferMessage } from '../types';
import { isUserProjectionBufferMessage, isVideoProjectionBufferMessage } from '../guards';

@Injectable()
export class KafkaBufferAdapter implements OnModuleInit, ProjectionBufferPort {
  private consumer: Consumer;
  private producer: Producer;

  public constructor(
    @Inject(USER_PROJECTION_REPOSITORY_PORT)
    private readonly userProjectionRepo: UserProjectionRepositoryPort,
    @Inject(VIDEO_PROJECTION_REPOSITORY_PORT)
    private readonly videoProjectionRepo: VideoProjectionRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private readonly kafka: KafkaClient,
  ) {
    this.consumer = kafka.getConsumer({ groupId: 'projection', allowAutoTopicCreation: true });
    this.producer = kafka.getProducer({ allowAutoTopicCreation: true });
  }

  public async onModuleInit() {
    await this.consumer.subscribe({
      topic: 'buffer',
      fromBeginning: false,
    });

    await this.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;

        await this.handleUserBatch(this.getUsersBufferMessages(batch.messages));
        await this.handleVideoBatch(this.getVideoBufferMessages(batch.messages));
      },
    });
  }

  public getUsersBufferMessages(messages: KafkaMessage[]): UserProjectionBufferMessage[] {
    return messages
      .map((message) => JSON.parse(message.value!.toString()) as BufferMessage<Entity, any>)
      .filter(isUserProjectionBufferMessage);
  }

  public getVideoBufferMessages(messages: KafkaMessage[]): VideoProjectionBufferMessage[] {
    return messages
      .map((message) => JSON.parse(message.value!.toString()) as BufferMessage<Entity, any>)
      .filter(isVideoProjectionBufferMessage);
  }

  async bufferUserOnBoardedProjection(payload: UserOnBoardedProjection): Promise<void> {
    const userBufferMessage = new UserProjectionBufferMessage(payload);

    await this.producer.send({
      topic: 'buffer',
      messages: [{ value: JSON.stringify(userBufferMessage) }],
    });
  }

  async bufferVideoPublishedProjection(payload: VideoPublishedProjection): Promise<void> {
    const videoBufferMessage = new VideoProjectionBufferMessage(payload);

    await this.producer.send({
      topic: 'buffer',
      messages: [{ value: JSON.stringify(videoBufferMessage) }],
    });
  }

  private async handleUserBatch(messages: UserProjectionBufferMessage[]) {
    const payload = messages.map((message) => message.payload);
    if (messages.length > 0) {
      this.logger.info(`Saving ${messages.length} users to projection`);
      await this.userProjectionRepo.saveManyUser(payload);
    }
  }

  private async handleVideoBatch(messages: VideoProjectionBufferMessage[]) {
    const payload = messages.map((message) => message.payload);
    if (messages.length > 0) {
      this.logger.info(`Saving ${messages.length} videos to projection`);
      await this.videoProjectionRepo.saveManyVideos(payload);
    }
  }
}
