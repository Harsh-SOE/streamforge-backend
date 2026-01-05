// TODO add handler here
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Consumer, EachBatchPayload, KafkaMessage, Producer } from 'kafkajs';

import { KafkaClient } from '@app/clients/kafka';
import { BUFFER_EVENTS } from '@app/common/events';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import {
  ReactionBufferPort,
  ReactionRepositoryPort,
  REACTION_DATABASE_PORT,
} from '@reaction/application/ports';
import { ReactionAggregate } from '@reaction/domain/aggregates';
import { TransportDomainReactionStatusEnumMapper } from '@reaction/infrastructure/anti-corruption';

import { ReactionMessage } from '../types';

@Injectable()
export class KafkaBufferAdapter implements OnModuleInit, ReactionBufferPort {
  private readonly consumer: Consumer;
  private readonly producer: Producer;

  public constructor(
    private readonly kafka: KafkaClient,
    @Inject(REACTION_DATABASE_PORT)
    private readonly reactionsRepo: ReactionRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {
    this.consumer = kafka.getConsumer({ groupId: 'reaction-buffer' });
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
    await this.consumer.subscribe({
      topic: BUFFER_EVENTS.REACTION_BUFFER_EVENT,
      fromBeginning: false,
    });

    await this.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;

        if (batch.topic !== BUFFER_EVENTS.REACTION_BUFFER_EVENT.toString()) {
          return;
        }

        await this.processCommentMessages(batch.messages);
      },
    });
  }

  public async bufferReaction(reaction: ReactionAggregate): Promise<void> {
    await this.producer.send({
      topic: BUFFER_EVENTS.REACTION_BUFFER_EVENT,
      messages: [{ value: JSON.stringify(reaction) }],
    });
  }

  private async processCommentMessages(messages: KafkaMessage[]) {
    const ReactionMessages = messages
      .filter((message) => message.value)
      .map((message) => JSON.parse(message.value!.toString()) as ReactionMessage);

    const models = ReactionMessages.map((message) => {
      const reactionStatus = TransportDomainReactionStatusEnumMapper[message.reactionStatus];
      return ReactionAggregate.create({
        userId: message.userId,
        videoId: message.videoId,
        reactionStatus,
      });
    });

    this.logger.info(`Saving ${models.length} reactions in database`);

    await this.reactionsRepo.saveManyReaction(models);

    this.logger.info(`${models.length} reactions saved in database`);
  }
}
