import { EachBatchPayload, KafkaMessage } from 'kafkajs';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import {
  ReactionBufferPort,
  ReactionRepositoryPort,
  REACTION_DATABASE_PORT,
} from '@reaction/application/ports';
import { BUFFER_EVENTS } from '@app/clients';
import { KafkaClient } from '@app/clients/kafka';
import { ReactionAggregate } from '@reaction/domain/aggregates';
import { TransportDomainReactionStatusEnumMapper } from '@reaction/infrastructure/anti-corruption';

import { ReactionMessage } from '../types';

@Injectable()
export class KafkaBufferAdapter implements OnModuleInit, ReactionBufferPort {
  public constructor(
    private readonly kafka: KafkaClient,
    @Inject(REACTION_DATABASE_PORT)
    private readonly reactionsRepo: ReactionRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public async onModuleInit() {
    await this.kafka.consumer.subscribe({
      topic: BUFFER_EVENTS.REACTION_BUFFER_EVENT,
      fromBeginning: false,
    });

    await this.kafka.consumer.run({
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
    await this.kafka.producer.send({
      topic: BUFFER_EVENTS.REACTION_BUFFER_EVENT,
      messages: [{ value: JSON.stringify(reaction.getSnapshot()) }],
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
