import { EachBatchPayload, KafkaMessage } from 'kafkajs';
import { Inject, Injectable } from '@nestjs/common';

import { BUFFER_EVENTS } from '@app/clients';
import { KafkaClient } from '@app/clients/kafka';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import {
  VideosBufferPort,
  VIDEOS_RESPOSITORY_PORT,
  VideoRepositoryPort,
} from '@videos/application/ports';
import { VideoAggregate } from '@videos/domain/aggregates';

import { VideoMessage } from '../types';

@Injectable()
export class KafkaBufferAdapter implements VideosBufferPort {
  public constructor(
    @Inject(VIDEOS_RESPOSITORY_PORT)
    private readonly videosRepository: VideoRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private readonly kafka: KafkaClient,
  ) {}

  public async onModuleInit() {
    await this.kafka.consumer.subscribe({
      topic: BUFFER_EVENTS.VIDEOS_BUFFER_EVENT,
      fromBeginning: false,
    });

    await this.kafka.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;

        if (batch.topic !== BUFFER_EVENTS.VIDEOS_BUFFER_EVENT.toString()) {
          return;
        }

        await this.processVideosMessages(batch.messages);
      },
    });
  }

  public async bufferVideo(video: VideoAggregate): Promise<void> {
    await this.kafka.producer.send({
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
        ownerId: message.ownerId,
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
