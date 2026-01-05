import { Consumer } from 'kafkajs';
import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { ENVIRONMENT } from '@app/utils/enums';
import { KafkaClient } from '@app/clients/kafka';
import { EventsConsumerPort } from '@app/common/ports/events';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { KafkaEventConsumerHandler } from '@app/handlers/events-consumer/kafka';
import { CHANNEL_EVENTS, IntegrationEvent, USERS_EVENTS, VIDEO_EVENTS } from '@app/common/events';

import { ProjectionConfigService } from '@projection/infrastructure/config';

@Injectable()
export class ProjectionKafkaConsumerAdapter
  implements EventsConsumerPort, OnModuleInit, OnModuleDestroy
{
  private readonly consumer: Consumer;

  public constructor(
    private readonly configService: ProjectionConfigService,
    private readonly handler: KafkaEventConsumerHandler,
    private readonly kafka: KafkaClient,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {
    this.consumer = kafka.getConsumer({
      groupId: 'comments',
    });
  }

  public async onModuleInit() {
    await this.handler.execute(async () => await this.connect(), { operationType: 'CONNECT' });
  }

  public async onModuleDestroy() {
    await this.handler.execute(async () => await this.disconnect(), {
      operationType: 'DISCONNECT',
    });
  }

  public async subscribe(eventNames: Array<string>): Promise<void> {
    await this.consumer.subscribe({
      topics: eventNames,
      fromBeginning: this.configService.NODE_ENVIRONMENT === ENVIRONMENT.DEVELOPMENT,
    });
  }

  public async connect(): Promise<void> {
    await this.consumer.connect();
    this.logger.alert('Kafka Consumer connected successfully');

    const eventsToSubscribe = [
      USERS_EVENTS.USER_ONBOARDED_EVENT,
      USERS_EVENTS.USER_PROFILE_UPDATED_EVENT,
      VIDEO_EVENTS.VIDEO_UPLOADED_EVENT,
      CHANNEL_EVENTS.CHANNEL_CREATED,
    ];
    await this.subscribe(eventsToSubscribe.map((event) => event.toString()));
    this.logger.info(`Kafka Consumer subscribed to events: [${eventsToSubscribe.join(', ')}]`);
  }

  public async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    this.logger.alert('Kafka Consumer disconnected successfully');
  }

  public async consumeMessage(
    onConsumeMessageHandler: (message: IntegrationEvent<any>) => Promise<void>,
  ): Promise<void> {
    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) {
          return;
        }

        const eventMessage = JSON.parse(message.value.toString()) as IntegrationEvent<any>;

        const consumeMessageOperation = async () => await onConsumeMessageHandler(eventMessage);

        await this.handler.execute(consumeMessageOperation, {
          operationType: 'CONSUME',
          topic,
          message: eventMessage,
        });
      },
    });
  }
}
