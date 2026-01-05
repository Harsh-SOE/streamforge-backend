import { Inject, Injectable } from '@nestjs/common';
import { Consumer, EachBatchPayload, KafkaMessage, Producer } from 'kafkajs';

import { KafkaClient } from '@app/clients/kafka';
import { BUFFER_EVENTS } from '@app/common/events';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import {
  VideosBufferPort,
  VIDEOS_RESPOSITORY_PORT,
  VideoRepositoryPort,
} from '@videos/application/ports';
import { VideoAggregate } from '@videos/domain/aggregates';

import { VideoMessage } from '../types';

@Injectable()
export class KafkaBufferAdapter implements VideosBufferPort {
  private readonly consumer: Consumer;
  private readonly producer: Producer;

  public constructor(
    @Inject(VIDEOS_RESPOSITORY_PORT)
    private readonly videosRepository: VideoRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private readonly kafka: KafkaClient,
  ) {
    this.consumer = kafka.getConsumer({ groupId: 'videos', allowAutoTopicCreation: true });
    this.producer = kafka.getProducer({ allowAutoTopicCreation: true });
  }

  public async onModuleInit() {
    await this.connect();
    await this.disconnect();

    await this.consumer.subscribe({
      topic: BUFFER_EVENTS.VIDEOS_BUFFER_EVENT,
      fromBeginning: true,
    });

    await this.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;

        if (batch.topic !== BUFFER_EVENTS.VIDEOS_BUFFER_EVENT.toString()) {
          return;
        }

        await this.processVideosMessages(batch.messages);
      },
    });
  }

  public async connect(): Promise<void> {
    await this.consumer.connect();
    await this.producer.connect();
  }

  public async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    await this.consumer.disconnect();
  }

  public async bufferVideo(video: VideoAggregate): Promise<void> {
    await this.producer.send({
      topic: BUFFER_EVENTS.VIDEOS_BUFFER_EVENT,
      messages: [{ value: JSON.stringify(video.getSnapshot()) }],
    });
  }

  private async processVideosMessages(messages: KafkaMessage[]) {
    const videosMessages = messages
      .filter((message) => message.value)
      .map((message) => JSON.parse(message.value!.toString()) as VideoMessage);

    const models = videosMessages.map((message) => {
      return VideoAggregate.create({
        id: message.id,
        userId: message.ownerId,
        channelId: message.channelId,
        title: message.title,
        videoThumbnailIdentifier: message.videoThumbnailIdentifier,
        videoFileIdentifier: message.videoFileIdentifier,
        categories: message.videoCategories,
        publishStatus: message.publishStatus,
        visibilityStatus: message.visibilityStatus,
        description: message.description,
      });
    });

    this.logger.info(`Saving ${models.length} likes in database`);

    await this.videosRepository.saveManyVideos(models);

    this.logger.info(`${models.length} likes saved in database`);
  }
}
