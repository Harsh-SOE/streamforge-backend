import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Consumer, EachBatchPayload, Kafka, Producer } from 'kafkajs';

import { UserProfileCreatedEventDto } from '@app/contracts/users';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import {
  USER_PROJECTION_REPOSITORY_PORT,
  UserProjectionBufferPort,
  UserProjectionRepositoryPort,
} from '@projection/application/ports';
import { AppConfigService } from '@projection/infrastructure/config';

export const USER_PROFILE_PROJECTION_BUFFER_TOPIC =
  'user_profile_created_projection_topic';

@Injectable()
export class UserKafkaBufferAdapter
  implements OnModuleInit, OnModuleDestroy, UserProjectionBufferPort
{
  private readonly kafkaClient: Kafka;
  private readonly producer: Producer;
  private readonly consumer: Consumer;

  public constructor(
    private readonly configService: AppConfigService,
    @Inject(USER_PROJECTION_REPOSITORY_PORT)
    private readonly projectionRepo: UserProjectionRepositoryPort,
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
      topic: USER_PROFILE_PROJECTION_BUFFER_TOPIC,
      fromBeginning: false,
    });
  }

  public async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  async bufferUserCards(event: UserProfileCreatedEventDto): Promise<void> {
    await this.producer.send({
      topic: USER_PROFILE_PROJECTION_BUFFER_TOPIC,
      messages: [{ value: JSON.stringify(event) }],
    });
  }

  async processUserCards(): Promise<number | void> {
    await this.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;
        const messages = batch.messages
          .filter((message) => message.value)
          .map(
            (message) =>
              JSON.parse(
                message.value!.toString(),
              ) as UserProfileCreatedEventDto,
          );

        this.logger.info(
          `Saving ${messages.length} profiles in projection database`,
        );

        await this.projectionRepo.saveManyUser(messages);

        this.logger.info(`${messages.length} profiles in projection database`);
      },
    });
  }
}
