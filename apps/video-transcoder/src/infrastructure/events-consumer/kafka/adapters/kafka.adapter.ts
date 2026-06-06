import { Consumer } from 'kafkajs';
import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { ENVIRONMENT } from '@app/utils/enums';
import { KafkaClient } from '@app/clients/kafka';
import { EventsConsumerPort } from '@app/common/ports/events';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { AGGREGATE_EVENT, IntegrationEvent } from '@app/common/events';
import { KafkaEventConsumerHandler } from '@app/handlers/events-consumer/kafka';

import { TranscoderConfigService } from '@transcoder/infrastructure/config';

@Injectable()
export class TranscoderKafkaConsumerAdapter
  implements EventsConsumerPort, OnModuleInit, OnModuleDestroy
{
  private readonly consumer: Consumer;

  public constructor(
    private readonly configService: TranscoderConfigService,
    private readonly handler: KafkaEventConsumerHandler,
    private readonly kafka: KafkaClient,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {
    this.consumer = kafka.getConsumer({
      groupId: 'videos-transcoder',
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

  public async connect(): Promise<void> {
    await this.consumer.connect();
    this.logger.alert('Kafka Consumer connected successfully');
    const eventsToSubscribe = [AGGREGATE_EVENT];
    await this.subscribe(eventsToSubscribe.map((e) => e.toString()));
    this.logger.info('Kafka Consumer subscribed to events: ' + eventsToSubscribe.join(', '));
  }

  public async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    this.logger.alert('Kafka Consumer disconnected successfully');
  }

  public async subscribe(eventNames: Array<string>): Promise<void> {
    await this.consumer.subscribe({
      topics: eventNames,
      fromBeginning: this.configService.NODE_ENVIRONMENT === ENVIRONMENT.DEVELOPMENT,
    });
  }

  public async consumeMessage(
    onConsumeMessageHandler: (message: IntegrationEvent<unknown>) => Promise<void>,
  ): Promise<void> {
    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) {
          return;
        }

        const eventMessage = JSON.parse(message.value.toString()) as IntegrationEvent<unknown>;

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
