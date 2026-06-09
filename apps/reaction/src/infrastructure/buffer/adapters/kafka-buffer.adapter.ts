// TODO add handler here
import { Consumer, EachBatchPayload, KafkaMessage, Producer } from 'kafkajs';
import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { Entity } from '@app/common';
import { KafkaClient } from '@app/clients/kafka';
import { BufferMessage } from '@app/common/buffer';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import {
  ReactionBufferPort,
  ReactionRepositoryPort,
  REACTION_DATABASE_PORT,
} from '@reaction/application/ports';
import {
  DomainTransportReactionStatusEnumMapper,
  TransportDomainReactionStatusEnumMapper,
} from '@reaction/infrastructure/anti-corruption';
import { ReactionAggregate } from '@reaction/domain/aggregates';

import { ReactionBufferMessage } from '../types';
import { isReactionBufferMessage } from '../guards';

@Injectable()
export class KafkaBufferAdapter implements OnModuleInit, OnModuleDestroy, ReactionBufferPort {
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

  public async onModuleInit() {
    await this.consumer.subscribe({
      topic: 'buffer',
      fromBeginning: false,
    });

    await this.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;

        // reject all messages that comes from topics other than BUFFER_EVENT (optional)
        if (batch.topic !== 'buffer') {
          return;
        }

        await this.processCommentMessages(this.getReactionBufferMessages(batch.messages));
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

  public async bufferReaction(reaction: ReactionAggregate): Promise<void> {
    const { reactionStatus, userId, videoId } = reaction.getSnapshot();

    const reactionProjectionEvent = new ReactionBufferMessage({
      userId: userId,
      videoId: videoId,
      reactionStatus: DomainTransportReactionStatusEnumMapper[reactionStatus],
    });

    await this.producer.send({
      topic: 'buffer',
      messages: [{ value: JSON.stringify(reactionProjectionEvent) }],
    });
  }

  public getReactionBufferMessages(messages: KafkaMessage[]): ReactionBufferMessage[] {
    return messages
      .map((message) => JSON.parse(message.value!.toString()) as BufferMessage<Entity, any>)
      .filter(isReactionBufferMessage);
  }

  private async processCommentMessages(messages: ReactionBufferMessage[]) {
    const models = messages.map((message) =>
      ReactionAggregate.create({
        userId: message.payload.userId,
        videoId: message.payload.videoId,
        reactionStatus: TransportDomainReactionStatusEnumMapper[message.payload.reactionStatus],
      }),
    );

    this.logger.info(`Saving ${models.length} reactions in database`);

    await this.reactionsRepo.saveManyReaction(models);

    this.logger.info(`${models.length} reactions saved in database`);
  }
}
