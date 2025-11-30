import { Consumer, Kafka, Producer } from 'kafkajs';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { MessageBrokerPort } from '@app/ports/message-broker';
import { KafkaMessageBrokerHandler } from '@app/handlers/message-broker-handler';

import { AppConfigService } from '@channel/infrastructure/config';

@Injectable()
export class KafkaMessageBrokerAdapter
  implements MessageBrokerPort, OnModuleInit, OnModuleDestroy
{
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  public constructor(
    private readonly configService: AppConfigService,
    private kafkaMessageBrokerHandler: KafkaMessageBrokerHandler,
  ) {
    this.kafka = new Kafka({
      brokers: [
        `${this.configService.MESSAGE_BROKER_HOST}:${this.configService.MESSAGE_BROKER_PORT}`,
      ],
      clientId: this.configService.CHANNEL_CLIENT_ID,
    });

    this.producer = this.kafka.producer({ allowAutoTopicCreation: true });
    this.consumer = this.kafka.consumer({
      groupId: this.configService.CHANNEL_CONSUMER_ID,
    });
  }

  public async onModuleInit() {
    await this.producer.connect();
    await this.consumer.connect();
  }

  public async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  public async publishMessage(topic: string, payload: string): Promise<void> {
    const kafkaPublishMessageOperation = () =>
      this.producer.send({ topic, messages: [{ key: 'xyz', value: payload }] });

    await this.kafkaMessageBrokerHandler.filter(kafkaPublishMessageOperation, {
      operationType: 'PUBLISH_OR_SEND',
      topic,
      message: String(payload),
      logErrors: true,
      suppressErrors: false,
    });
  }

  public async subscribeTo(topic: string): Promise<void> {
    const kafkaSubscribeOperation = () =>
      this.consumer.subscribe({ topic, fromBeginning: true });
    await this.kafkaMessageBrokerHandler.filter(kafkaSubscribeOperation, {
      operationType: 'SUBSCRIBE',
      topic,
      logErrors: true,
      suppressErrors: false,
    });
  }
}
