import { EachBatchPayload, KafkaMessage } from 'kafkajs';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { KafkaClient } from '@app/clients/kafka';
import { PROJECTION_EVENTS } from '@app/clients';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { VideoUploadedEventDto } from '@app/contracts/videos';
import { UserProfileCreatedEventDto } from '@app/contracts/users';
import { KafkaMessageBusHandler } from '@app/handlers/message-bus-handler';

import {
  USER_PROJECTION_REPOSITORY_PORT,
  ProjectionBufferPort,
  UserProjectionRepositoryPort,
  VIDEO_PROJECTION_REPOSITORY_PORT,
  VideoProjectionRepositoryPort,
} from '@projection/application/ports';
import { AppConfigService } from '@projection/infrastructure/config';

@Injectable()
export class KafkaBufferAdapter implements OnModuleInit, ProjectionBufferPort {
  public constructor(
    private readonly configService: AppConfigService,
    @Inject(USER_PROJECTION_REPOSITORY_PORT)
    private readonly userProjectionRepo: UserProjectionRepositoryPort,
    @Inject(VIDEO_PROJECTION_REPOSITORY_PORT)
    private readonly videoProjectionRepo: VideoProjectionRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private readonly kafkaClient: KafkaClient,
    private readonly kafkaHandler: KafkaMessageBusHandler,
  ) {}

  public async onModuleInit() {
    const userSubscribeOperation = async () =>
      await this.kafkaClient.consumer.subscribe({
        topic: PROJECTION_EVENTS.SAVE_USER_EVENT,
        fromBeginning: false,
      });

    const videosubscribeOperation = async () =>
      await this.kafkaClient.consumer.subscribe({
        topic: PROJECTION_EVENTS.SAVE_VIDEO_EVENT,
        fromBeginning: false,
      });

    await this.kafkaHandler.handle(userSubscribeOperation, {
      operationType: 'CONNECT_OR_DISCONNECT',
    });

    await this.kafkaHandler.handle(videosubscribeOperation, {
      operationType: 'CONNECT_OR_DISCONNECT',
    });

    await this.kafkaClient.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;

        const topic = batch.topic;
        switch (topic) {
          case PROJECTION_EVENTS.SAVE_USER_EVENT.toString():
            await this.handleUserBatch(batch.messages);
            break;

          case PROJECTION_EVENTS.SAVE_VIDEO_EVENT.toString():
            await this.handleVideoBatch(batch.messages);
            break;

          default:
            this.logger.alert(`Received batch for unknown topic: ${batch.topic}`);
        }
      },
    });
  }

  async bufferUser(event: UserProfileCreatedEventDto): Promise<void> {
    await this.kafkaClient.producer.send({
      topic: PROJECTION_EVENTS.SAVE_USER_EVENT,
      messages: [{ value: JSON.stringify(event) }],
    });
  }

  private async handleUserBatch(messages: KafkaMessage[]) {
    const userEvents = messages
      .filter((msg) => msg.value)
      .map((msg) => JSON.parse(msg.value!.toString()) as UserProfileCreatedEventDto);

    if (userEvents.length > 0) {
      this.logger.info(`Saving ${userEvents.length} users to projection`);
      await this.userProjectionRepo.saveManyUser(userEvents);
    }
  }

  private async handleVideoBatch(messages: KafkaMessage[]) {
    const videoEvents = messages
      .filter((msg) => msg.value)
      .map((msg) => JSON.parse(msg.value!.toString()) as VideoUploadedEventDto);

    if (videoEvents.length > 0) {
      this.logger.info(`Saving ${videoEvents.length} videos to projection`);
      await this.videoProjectionRepo.saveManyVideos(videoEvents);
    }
  }

  async bufferVideo(event: VideoUploadedEventDto): Promise<void> {
    await this.kafkaClient.producer.send({
      topic: PROJECTION_EVENTS.SAVE_VIDEO_EVENT,
      messages: [{ value: JSON.stringify(event) }],
    });
  }
}
