import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Consumer, EachBatchPayload, Kafka, Producer } from 'kafkajs';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import {
  ViewsBufferPort,
  ViewRepositoryPort,
  VIEWS_REPOSITORY_PORT,
} from '@views/application/ports';
import { ViewAggregate } from '@views/domain/aggregates';
import { AppConfigService } from '@views/infrastructure/config';

import { ViewMessage } from '../types';

export const VIEW_BUFFER_TOPIC = 'views';

@Injectable()
export class KafkaBufferAdapter
  implements OnModuleInit, OnModuleDestroy, ViewsBufferPort
{
  private readonly kafkaClient: Kafka;
  private readonly producer: Producer;
  private readonly consumer: Consumer;

  public constructor(
    private readonly configService: AppConfigService,
    @Inject(VIEWS_REPOSITORY_PORT)
    private readonly viewsRepo: ViewRepositoryPort,
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
      topic: VIEW_BUFFER_TOPIC,
      fromBeginning: false,
    });
  }

  public async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  public async bufferView(like: ViewAggregate): Promise<void> {
    await this.producer.send({
      topic: VIEW_BUFFER_TOPIC,
      messages: [{ value: JSON.stringify(like.getSnapshot()) }],
    });
  }

  public async processViewsBatch(): Promise<number | void> {
    await this.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;
        const messages = batch.messages
          .filter((message) => message.value)
          .map(
            (message) => JSON.parse(message.value!.toString()) as ViewMessage,
          );

        const models = messages.map((message) => {
          return ViewAggregate.create(message.userId, message.videoId);
        });

        this.logger.info(`Saving ${models.length} view in database`);

        await this.viewsRepo.saveMany(models);

        this.logger.info(`${models.length} view saved in database`);
      },
    });
  }
}
