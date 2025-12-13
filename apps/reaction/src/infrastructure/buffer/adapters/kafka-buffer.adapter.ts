import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, EachBatchPayload, Kafka, Producer } from 'kafkajs';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import {
  ReactionBufferPort,
  ReactionRepositoryPort,
  REACTION_DATABASE_PORT,
} from '@reaction/application/ports';
import { ReactionAggregate } from '@reaction/domain/aggregates';
import { AppConfigService } from '@reaction/infrastructure/config';
import { GrpcDomainReactionStatusEnumMapper } from '@reaction/infrastructure/anti-corruption';

import { ReactionMessage } from '../types';

export const REACTION_BUFFER_TOPIC = 'reaction';

@Injectable()
export class KafkaBufferAdapter implements OnModuleInit, OnModuleDestroy, ReactionBufferPort {
  private readonly kafkaClient: Kafka;
  private readonly producer: Producer;
  private readonly consumer: Consumer;

  public constructor(
    private readonly configService: AppConfigService,
    @Inject(REACTION_DATABASE_PORT)
    private readonly reactionsRepo: ReactionRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {
    this.kafkaClient = new Kafka({
      brokers: [`${configService.MESSAGE_BROKER_HOST}:${configService.MESSAGE_BROKER_PORT}`],
      clientId: this.configService.BUFFER_CLIENT_ID,
    });

    this.producer = this.kafkaClient.producer();

    this.consumer = this.kafkaClient.consumer({
      groupId: this.configService.BUFFER_KAFKA_CONSUMER_ID,
      maxWaitTimeInMs: this.configService.BUFFER_FLUSH_MAX_WAIT_TIME_MS,
      maxBytesPerPartition: 512_000,
      sessionTimeout: 30_000,
      heartbeatInterval: 3_000,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });
  }

  public async onModuleInit() {
    await this.producer.connect();
    await this.consumer.connect();

    await this.consumer.subscribe({
      topic: REACTION_BUFFER_TOPIC,
      fromBeginning: false,
    });
  }

  public async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  public async bufferReaction(reaction: ReactionAggregate): Promise<void> {
    await this.producer.send({
      topic: REACTION_BUFFER_TOPIC,
      messages: [{ value: JSON.stringify(reaction.getSnapshot()) }],
    });
  }

  public async processReactionsBatch(): Promise<number | void> {
    await this.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;
        const messages = batch.messages
          .filter((message) => message.value)
          .map((message) => JSON.parse(message.value!.toString()) as ReactionMessage);

        const models = messages.map((message) => {
          const reactionStatus = GrpcDomainReactionStatusEnumMapper.get(message.reactionStatus);
          if (!reactionStatus) throw new Error();
          return ReactionAggregate.create(message.userId, message.videoId, reactionStatus);
        });

        this.logger.info(`Saving ${models.length} reactions in database`);

        await this.reactionsRepo.saveMany(models);

        this.logger.info(`${models.length} reactions saved in database`);
      },
    });
  }
}
