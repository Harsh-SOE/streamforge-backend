import { Producer } from 'kafkajs';
import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { KafkaClient } from '@app/clients/kafka';
import { IntegrationEvent } from '@app/common/events';
import { EventsPublisherPort } from '@app/common/ports/events';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { KafkaEventPublisherHandler } from '@app/handlers/events-publisher/kafka';

@Injectable()
export class UsersKafkaEventsPublisherAdapter
  implements EventsPublisherPort, OnModuleInit, OnModuleDestroy
{
  private readonly producer: Producer;

  public constructor(
    private readonly handler: KafkaEventPublisherHandler,
    private readonly kafka: KafkaClient,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {
    this.producer = kafka.getProducer({ allowAutoTopicCreation: true });
  }

  public async connect(): Promise<void> {
    this.logger.alert(`Producer connecting to kafka...`);
    await this.producer.connect();
    this.logger.alert(`Producer successfully connected to kafka!`);
  }

  public async disconnect(): Promise<void> {
    this.logger.alert(`Producer disconnecting from kafka...`);
    await this.producer.disconnect();
    this.logger.alert(`Producer successfully disconnected from kafka!`);
  }

  public async onModuleInit() {
    await this.connect();
  }

  public async onModuleDestroy() {
    await this.disconnect();
  }

  public async publishMessage<TPayload extends { userId?: string }>(
    message: IntegrationEvent<TPayload>,
  ): Promise<void> {
    const sendMessageOperation = async () =>
      await this.producer.send({
        topic: message.eventName,
        messages: [{ key: message.eventId, value: JSON.stringify(message) }],
      });

    await this.handler.execute(sendMessageOperation, {
      operationType: 'PUBLISH',
      topic: message.eventName,
      message,
    });
  }
}
