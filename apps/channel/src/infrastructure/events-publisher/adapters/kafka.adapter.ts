import { Producer } from 'kafkajs';
import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { KafkaClient } from '@app/clients/kafka';
import { IntegrationEvent } from '@app/contracts/events/base';
import { IntegrationEventsPublisherPort } from '@app/common/ports/events';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { KafkaEventPublisherHandler } from '@app/handlers/events-publisher/kafka';

@Injectable()
export class ChannelKafkaPublisherAdapter
  implements IntegrationEventsPublisherPort, OnModuleInit, OnModuleDestroy
{
  private readonly producer: Producer;

  public constructor(
    @Inject(LOGGER_PORT)
    private readonly logger: LoggerPort,

    private readonly handler: KafkaEventPublisherHandler,
    private readonly kafka: KafkaClient,
  ) {
    this.producer = kafka.getProducer({ allowAutoTopicCreation: true });
  }

  public async onModuleInit() {
    await this.connect();
  }

  public async onModuleDestroy() {
    await this.disconnect();
  }

  public async connect(): Promise<void> {
    await this.producer.connect();
    this.logger.alert('Kafka Producer connected successfully');
  }

  public async disconnect(): Promise<void> {
    await this.producer.disconnect();
    this.logger.alert('Kafka Producer disconnected successfully');
  }

  public async publishMessage<TPayload>(message: IntegrationEvent<TPayload>): Promise<void> {
    const sendMessageOperation = async () =>
      await this.producer.send({
        topic: message.name,
        messages: [{ key: message.id, value: JSON.stringify(message) }],
      });

    await this.handler.execute(sendMessageOperation, {
      operationType: 'PUBLISH',
      topic: message.name,
      message,
    });
  }
}
