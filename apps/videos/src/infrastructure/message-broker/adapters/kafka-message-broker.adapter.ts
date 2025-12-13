import { Consumer, Kafka, Producer } from 'kafkajs';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { MessageBrokerPort } from '@app/ports/message-broker';
import { KafkaMessageBrokerHandler } from '@app/handlers/message-broker-handler';

import { AppConfigService } from '@videos/infrastructure/config';

@Injectable()
export class KafkaMessageBrokerAdapter implements MessageBrokerPort, OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  public constructor(
    private readonly configService: AppConfigService,
    private readonly kafkaFilter: KafkaMessageBrokerHandler,
  ) {
    this.kafka = new Kafka({
      brokers: [
        `${this.configService.MESSAGE_BROKER_HOST}:${this.configService.MESSAGE_BROKER_PORT}`,
      ],
      clientId: this.configService.VIDEO_CLIENT_ID,
    });

    this.producer = this.kafka.producer({ allowAutoTopicCreation: true });
    this.consumer = this.kafka.consumer({
      groupId: this.configService.VIDEO_CONSUMER_ID,
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

    await this.kafkaFilter.execute(kafkaPublishMessageOperation, {
      operationType: 'PUBLISH_OR_SEND',
      topic,
      message: String(payload),
      logErrors: true,
      suppressErrors: false,
    });
  }

  public async subscribeTo(topic: string): Promise<void> {
    const kafkaSubscribeOperation = () => this.consumer.subscribe({ topic, fromBeginning: true });
    await this.kafkaFilter.execute(kafkaSubscribeOperation, {
      operationType: 'SUBSCRIBE',
      topic,
      logErrors: true,
      suppressErrors: false,
    });
  }
}
