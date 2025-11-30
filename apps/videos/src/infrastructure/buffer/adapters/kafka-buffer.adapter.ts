import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Consumer, EachBatchPayload, Kafka, Producer } from 'kafkajs';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import {
  VideosBufferPort,
  VIDEOS_COMMAND_RESPOSITORY_PORT,
  VideoCommandRepositoryPort,
} from '@videos/application/ports';
import { VideoAggregate } from '@videos/domain/aggregates';
import { AppConfigService } from '@videos/infrastructure/config';

import { VideoMessage } from '../types';

export const VIDEO_BUFFER_TOPIC = 'videos';

@Injectable()
export class KafkaBufferAdapter
  implements OnModuleInit, OnModuleDestroy, VideosBufferPort
{
  private readonly kafkaClient: Kafka;
  private readonly producer: Producer;
  private readonly consumer: Consumer;

  public constructor(
    private readonly configService: AppConfigService,
    @Inject(VIDEOS_COMMAND_RESPOSITORY_PORT)
    private readonly videosRepository: VideoCommandRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {
    this.kafkaClient = new Kafka({
      brokers: [
        `${configService.MESSAGE_BROKER_HOST}:${configService.MESSAGE_BROKER_PORT}`,
      ],
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
      topic: VIDEO_BUFFER_TOPIC,
      fromBeginning: false,
    });
  }

  public async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  public async bufferVideo(video: VideoAggregate): Promise<void> {
    await this.producer.send({
      topic: VIDEO_BUFFER_TOPIC,
      messages: [{ value: JSON.stringify(video.getSnapshot()) }],
    });
  }

  public async processVideosBatch(): Promise<number | void> {
    await this.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;
        const messages = batch.messages
          .filter((message) => message.value)
          .map(
            (message) => JSON.parse(message.value!.toString()) as VideoMessage,
          );

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

        await this.videosRepository.saveMany(models);

        this.logger.info(`${models.length} likes saved in database`);
      },
    });
  }
}
