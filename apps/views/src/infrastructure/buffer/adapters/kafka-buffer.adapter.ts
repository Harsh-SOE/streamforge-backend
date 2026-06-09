import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, EachBatchPayload, KafkaMessage, Producer } from 'kafkajs';

import { Entity } from '@app/common';
import { KafkaClient } from '@app/clients/kafka';
import { BufferMessage } from '@app/common/buffer';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import {
  ViewsBufferPort,
  ViewRepositoryPort,
  VIEWS_REPOSITORY_PORT,
} from '@views/application/ports';
import { ViewAggregate } from '@views/domain/aggregates';

import { ViewBufferMessage } from '../types';
import { isViewBufferMessage } from '../guards';

@Injectable()
export class KafkaBufferAdapter implements OnModuleInit, OnModuleDestroy, ViewsBufferPort {
  private readonly consumer: Consumer;
  private readonly producer: Producer;

  public constructor(
    @Inject(VIEWS_REPOSITORY_PORT)
    private readonly viewsRepo: ViewRepositoryPort,
    private readonly kafka: KafkaClient,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {
    this.consumer = kafka.getConsumer({ groupId: 'views' });
    this.producer = kafka.getProducer({ allowAutoTopicCreation: true });
  }

  public async onModuleInit() {
    await this.connect();

    await this.consumer.subscribe({
      topic: 'buffer',
      fromBeginning: false,
    });

    await this.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;

        if (batch.topic !== 'buffer') {
          return;
        }

        await this.processViewsMessages(this.getViewMessage(batch.messages));
      },
    });
  }

  public async onModuleDestroy() {
    await this.disconnect();
  }

  public async connect(): Promise<void> {
    await this.consumer.connect();
    await this.producer.connect();
  }

  public async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    await this.producer.disconnect();
  }

  public async bufferView(like: ViewAggregate): Promise<void> {
    const { userId, videoId } = like.getSnapshot();

    const viewBufferMessages = new ViewBufferMessage({ userId, videoId });

    await this.producer.send({
      topic: 'buffer',
      messages: [{ value: JSON.stringify(viewBufferMessages) }],
    });
  }

  private getViewMessage(messages: KafkaMessage[]): ViewBufferMessage[] {
    return messages
      .map((message) => JSON.parse(message.value!.toString()) as BufferMessage<Entity, any>)
      .filter(isViewBufferMessage);
  }

  private async processViewsMessages(messages: ViewBufferMessage[]) {
    const viewPayload = messages.map((message) => message.payload);

    const models = viewPayload.map((message) => {
      return ViewAggregate.create({
        userId: message.userId,
        videoId: message.videoId,
      });
    });

    this.logger.info(`Saving ${models.length} view in database`);

    await this.viewsRepo.saveMany(models);

    this.logger.info(`${models.length} view saved in database`);
  }
}
