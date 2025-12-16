import { Injectable } from '@nestjs/common';

import { MessageBrokerPort } from '@app/ports/message-broker';
import { KafkaMessageBrokerHandler } from '@app/handlers/message-broker-handler';

import { VideosKafkaClient } from '@videos/infrastructure/clients/kafka';

@Injectable()
export class KafkaMessageBrokerAdapter implements MessageBrokerPort {
  public constructor(
    private readonly videosKafkaClient: VideosKafkaClient,
    private readonly kafkaFilter: KafkaMessageBrokerHandler,
  ) {}

  public async publishMessage(topic: string, payload: string): Promise<void> {
    const kafkaPublishMessageOperation = () =>
      this.videosKafkaClient.producer.send({
        topic,
        messages: [{ key: 'videos', value: payload }],
      });

    await this.kafkaFilter.execute(kafkaPublishMessageOperation, {
      operationType: 'PUBLISH_OR_SEND',
      topic,
      message: String(payload),
      logErrors: true,
      suppressErrors: false,
    });
  }

  public async subscribeTo(topic: string): Promise<void> {
    const kafkaSubscribeOperation = () =>
      this.videosKafkaClient.consumer.subscribe({ topic, fromBeginning: true });
    await this.kafkaFilter.execute(kafkaSubscribeOperation, {
      operationType: 'SUBSCRIBE',
      topic,
      logErrors: true,
      suppressErrors: false,
    });
  }
}
