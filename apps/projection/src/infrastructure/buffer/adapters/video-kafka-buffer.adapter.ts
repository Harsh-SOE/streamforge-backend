import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, EachBatchPayload, Kafka, Producer } from 'kafkajs';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { VideoUploadedEventDto } from '@app/contracts/videos';

import {
  VIDEO_PROJECTION_REPOSITORY_PORT,
  VideoProjectionBufferPort,
  VideoProjectionRepositoryPort,
} from '@projection/application/ports';
import { AppConfigService } from '@projection/infrastructure/config';

export const VIDEO_PROJECTION_BUFFER_TOPIC = 'video_projection_event';

@Injectable()
export class VideoKafkaBufferAdapter
  implements OnModuleInit, OnModuleDestroy, VideoProjectionBufferPort
{
  private readonly kafkaClient: Kafka;
  private readonly producer: Producer;
  private readonly consumer: Consumer;

  public constructor(
    private readonly configService: AppConfigService,
    @Inject(VIDEO_PROJECTION_REPOSITORY_PORT)
    private readonly projectionRepo: VideoProjectionRepositoryPort,
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
      topic: VIDEO_PROJECTION_BUFFER_TOPIC,
      fromBeginning: false,
    });
  }

  public async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  async bufferVideoCards(event: VideoUploadedEventDto): Promise<void> {
    await this.producer.send({
      topic: VIDEO_PROJECTION_BUFFER_TOPIC,
      messages: [{ value: JSON.stringify(event) }],
    });
  }

  async processVideoCards(): Promise<number | void> {
    await this.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;
        const messages = batch.messages
          .filter((message) => message.value)
          .map((message) => JSON.parse(message.value!.toString()) as VideoUploadedEventDto);

        this.logger.info(`Saving ${messages.length} profiles in projection database`);

        await this.projectionRepo.saveManyVideos(messages);

        this.logger.info(`${messages.length} profiles in projection database`);
      },
    });
  }
}
