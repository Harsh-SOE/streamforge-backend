import { Consumer, EachBatchPayload, KafkaMessage, Producer } from 'kafkajs';
import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { KafkaClient } from '@app/clients/kafka';
import { BUFFER_EVENTS } from '@app/common/events';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { KafkaBufferHandler } from '@app/handlers/buffer/kafka';

import {
  UsersBufferPort,
  USER_REROSITORY_PORT,
  UserRepositoryPort,
} from '@users/application/ports';
import { UserAggregate } from '@users/domain/aggregates';

import { UserMessage } from '../types';

@Injectable()
export class UsersKafkaBuffer implements UsersBufferPort, OnModuleInit, OnModuleDestroy {
  private consumer: Consumer;
  private producer: Producer;

  public constructor(
    @Inject(USER_REROSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
    @Inject(LOGGER_PORT)
    private readonly logger: LoggerPort,
    private readonly kafka: KafkaClient,
    private readonly handler: KafkaBufferHandler,
  ) {
    this.consumer = this.kafka.getConsumer({ groupId: 'users' });
    this.producer = this.kafka.getProducer({ allowAutoTopicCreation: true });
    this.logger.alert(`Using kafka as buffer for users service`);
  }

  public async connect(): Promise<void> {
    this.logger.alert(`Kafka buffer connecting...`);
    await this.producer.connect();
    await this.consumer.connect();
    this.logger.alert(`Kafka buffer connected successfully`);
  }

  public async disconnect(): Promise<void> {
    this.logger.alert(`Kafka buffer disconnecting...`);
    await this.producer.disconnect();
    await this.consumer.disconnect();
    this.logger.alert(`Kafka buffer disconnected successfully`);
  }

  public async onModuleInit() {
    await this.handler.execute(async () => await this.connect(), {
      operationType: 'CONNECT',
    });

    await this.handler.execute(
      async () =>
        await this.consumer.subscribe({
          topic: BUFFER_EVENTS.USER_BUFFER_EVENT,
          fromBeginning: false,
        }),
      {
        operationType: 'CONNECT',
      },
    );

    const startConsumerOperation = async () =>
      await this.consumer.run({
        eachBatch: async (payload: EachBatchPayload) => {
          const { batch } = payload;

          if (batch.topic !== BUFFER_EVENTS.USER_BUFFER_EVENT.toString()) {
            return;
          }

          await this.processUsersMessages(batch.messages);
        },
      });

    await this.handler.execute(startConsumerOperation, { operationType: 'FLUSH' });
  }

  public async onModuleDestroy() {
    await this.handler.execute(async () => await this.disconnect(), {
      operationType: 'DISCONNECT',
    });
  }

  public async bufferUser(user: UserAggregate): Promise<void> {
    const publishToKafkaBufferOperation = async () =>
      await this.producer.send({
        topic: BUFFER_EVENTS.USER_BUFFER_EVENT,
        messages: [{ value: JSON.stringify(user.getUserSnapshot()) }],
      });

    await this.handler.execute(publishToKafkaBufferOperation, {
      operationType: 'SAVE',
      valueToBuffer: JSON.stringify(user.getUserSnapshot()),
    });
  }

  private async processUsersMessages(messages: KafkaMessage[]) {
    const usersMessages = messages
      .filter((message) => message.value)
      .map((message) => JSON.parse(message.value!.toString()) as UserMessage);

    const models = usersMessages.map((message) => {
      return UserAggregate.create({
        id: message.id,
        email: message.email,
        handle: message.handle,
        avatarUrl: message.avatarUrl,
        userAuthId: message.userAuthId,
        dob: message.dob ? new Date(message.dob) : undefined,
        phoneNumber: message.phoneNumber,
        isPhoneNumberVerified: message.isPhoneNumbetVerified,
        notification: message.notification,
        preferredLanguage: message.languagePreference,
        preferredTheme: message.themePreference,
        region: message.region,
      });
    });

    this.logger.info(`Saving ${models.length} likes in database`);

    await this.userRepository.saveManyUsers(models);

    this.logger.info(`${models.length} likes saved in database`);
  }
}
