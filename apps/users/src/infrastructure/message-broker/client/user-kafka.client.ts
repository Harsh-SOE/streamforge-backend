import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, Kafka, Producer } from 'kafkajs';

import { KafkaMessageBrokerHandler } from '@app/handlers/message-broker-handler';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import { AppConfigService } from '@users/infrastructure/config';

@Injectable()
export class UserKafkaClient extends Kafka implements OnModuleInit, OnModuleDestroy {
  public messageProducer: Producer;
  public messageConsumer: Consumer;

  public constructor(
    private readonly kafkaMessageHandler: KafkaMessageBrokerHandler,
    private readonly configService: AppConfigService,
    @Inject(LOGGER_PORT) private readonly loggerAdapter: LoggerPort,
  ) {
    super({
      brokers: [`${configService.MESSAGE_BROKER_HOST}:${configService.MESSAGE_BROKER_PORT}`],
      clientId: configService.USER_CLIENT_ID,
    });
    this.messageProducer = this.producer({ allowAutoTopicCreation: true });
    this.messageConsumer = this.consumer({
      groupId: this.configService.USER_CONSUMER_ID,
    });
  }

  public async onModuleInit() {
    const kafkaProducerConnectionOperation = async () => await this.messageProducer.connect();
    const kafkaConsumerConnectionOperation = async () => await this.messageConsumer.connect();

    await this.kafkaMessageHandler.execute(kafkaProducerConnectionOperation, {
      operationType: 'CONNECT',
    });

    await this.kafkaMessageHandler.execute(kafkaConsumerConnectionOperation, {
      operationType: 'CONNECT',
    });

    this.loggerAdapter.info(`Kafka connected successfully`);
  }

  public async onModuleDestroy() {
    const kafkaProducerDisconnectionOperation = async () => await this.messageProducer.disconnect();
    const kafkaConsumerDisconnectionOperation = async () => await this.messageConsumer.disconnect();

    await this.kafkaMessageHandler.execute(kafkaProducerDisconnectionOperation, {
      operationType: 'CONNECT',
    });

    await this.kafkaMessageHandler.execute(kafkaConsumerDisconnectionOperation, {
      operationType: 'CONNECT',
    });

    this.loggerAdapter.info(`Kafka disconnected successfully`);
  }
}
