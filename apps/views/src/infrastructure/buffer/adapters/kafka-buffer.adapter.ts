import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, EachBatchPayload, KafkaMessage, Producer } from 'kafkajs';

import { BUFFER_EVENTS } from '@app/common/events';
import { KafkaClient } from '@app/clients/kafka';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import {
  ViewsBufferPort,
  ViewRepositoryPort,
  VIEWS_REPOSITORY_PORT,
} from '@views/application/ports';
import { ViewAggregate } from '@views/domain/aggregates';

import { ViewMessage } from '../types';

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

  public async connect(): Promise<void> {
    await this.consumer.connect();
    await this.producer.connect();
  }

  public async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    await this.producer.disconnect();
  }

  public async onModuleInit() {
    await this.connect();

    await this.consumer.subscribe({
      topic: BUFFER_EVENTS.VIEWS_BUFFER_EVENT,
      fromBeginning: false,
    });

    await this.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;

        if (batch.topic !== BUFFER_EVENTS.VIEWS_BUFFER_EVENT.toString()) {
          return;
        }

        await this.processViewsMessages(batch.messages);
      },
    });
  }

  public async onModuleDestroy() {
    await this.disconnect();
  }

  public async bufferView(like: ViewAggregate): Promise<void> {
    await this.producer.send({
      topic: BUFFER_EVENTS.VIEWS_BUFFER_EVENT,
      messages: [{ value: JSON.stringify(like.getSnapshot()) }],
    });
  }

  public async processViewsMessages(messages: KafkaMessage[]) {
    const viewsMessages = messages
      .filter((message) => message.value)
      .map((message) => JSON.parse(message.value!.toString()) as ViewMessage);

    const models = viewsMessages.map((message) => {
      return ViewAggregate.create({ userId: message.userId, videoId: message.videoId });
    });

    this.logger.info(`Saving ${models.length} view in database`);

    await this.viewsRepo.saveMany(models);

    this.logger.info(`${models.length} view saved in database`);
  }
}
