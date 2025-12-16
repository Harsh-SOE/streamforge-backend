import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, Kafka, Producer } from 'kafkajs';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { KafkaMessageBrokerHandler } from '@app/handlers/message-broker-handler';

import { AppConfigService } from '@videos/infrastructure/config';

@Injectable()
export class VideosKafkaClient implements OnModuleInit, OnModuleDestroy {
  public readonly kafkaClient: Kafka;
  public readonly consumer: Consumer;
  public readonly producer: Producer;

  public constructor(
    private readonly kafkaMessageHandler: KafkaMessageBrokerHandler,
    private readonly configService: AppConfigService,
    @Inject(LOGGER_PORT) private readonly loggerAdapter: LoggerPort,
  ) {
    this.kafkaClient = new Kafka({
      brokers: [`${configService.MESSAGE_BROKER_HOST}:${configService.MESSAGE_BROKER_PORT}`],
      clientId: configService.VIDEO_CLIENT_ID,
    });

    this.producer = this.kafkaClient.producer({ allowAutoTopicCreation: true });
    this.consumer = this.kafkaClient.consumer({
      groupId: this.configService.VIDEO_CONSUMER_ID,
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
    const kafkaProducerConnectionOperation = async () => await this.producer.connect();
    const kafkaConsumerConnectionOperation = async () => await this.consumer.connect();

    await this.kafkaMessageHandler.execute(kafkaProducerConnectionOperation, {
      operationType: 'CONNECT_OR_DISCONNECT',
    });

    await this.kafkaMessageHandler.execute(kafkaConsumerConnectionOperation, {
      operationType: 'CONNECT_OR_DISCONNECT',
    });

    this.loggerAdapter.info(`Kafka connected successfully`);
  }

  public async onModuleDestroy() {
    const kafkaProducerDisconnectionOperation = async () => await this.producer.disconnect();
    const kafkaConsumerDisconnectionOperation = async () => await this.consumer.disconnect();

    await this.kafkaMessageHandler.execute(kafkaProducerDisconnectionOperation, {
      operationType: 'CONNECT_OR_DISCONNECT',
    });

    await this.kafkaMessageHandler.execute(kafkaConsumerDisconnectionOperation, {
      operationType: 'CONNECT_OR_DISCONNECT',
    });

    this.loggerAdapter.info(`Kafka disconnected successfully`);
  }
}
