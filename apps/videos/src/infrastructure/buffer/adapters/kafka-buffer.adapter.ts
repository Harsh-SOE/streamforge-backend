import { EachBatchPayload } from 'kafkajs';
import { Inject, Injectable } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import {
  VideosBufferPort,
  VIDEOS_RESPOSITORY_PORT,
  VideoRepositoryPort,
} from '@videos/application/ports';
import { VideoAggregate } from '@videos/domain/aggregates';
import { VideosKafkaClient } from '@videos/infrastructure/clients/kafka';

import { VideoMessage } from '../types';

export const VIDEO_BUFFER_TOPIC = 'videos';

@Injectable()
export class KafkaBufferAdapter implements VideosBufferPort {
  public constructor(
    @Inject(VIDEOS_RESPOSITORY_PORT)
    private readonly videosRepository: VideoRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private readonly videoKafkaClient: VideosKafkaClient,
  ) {}

  public async onModuleInit() {
    await this.videoKafkaClient.consumer.subscribe({
      topic: VIDEO_BUFFER_TOPIC,
      fromBeginning: false,
    });
  }

  public async bufferVideo(video: VideoAggregate): Promise<void> {
    await this.videoKafkaClient.producer.send({
      topic: VIDEO_BUFFER_TOPIC,
      messages: [{ value: JSON.stringify(video.getSnapshot()) }],
    });
  }
  /*
  public async startConsumer() {
    await this.videoKafkaClient.consumer.run({
      autoCommit: false,
      eachBatch: async ({
        batch,
        resolveOffset,
        heartbeat,
        commitOffsetsIfNecessary,
        isRunning,
        isStale,
      }) => {
        const buffer: VideoAggregate[] = [];

        for (const message of batch.message) {
          if (!isRunning() || isStale()) break;

          const payload = JSON.parse(message.value!.toString()) as VideoMessage;

          buffer.push(VideoAggregate.create({ ...payload }));

          resolveOffset(message.offset);
          await heartbeat();
        }

        if (buffer.length > 0) {
          await this.videosRepository.saveManyVideos(buffer);
        }

        await commitOffsetsIfNecessary();
      },
    });
  }
  */
  public async processVideosBatch(): Promise<number | void> {
    await this.videoKafkaClient.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;
        const messages = batch.messages
          .filter((message) => message.value)
          .map((message) => JSON.parse(message.value!.toString()) as VideoMessage);

        const models = messages.map((message) => {
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
      },
    });
  }
}
