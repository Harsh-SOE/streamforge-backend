import Redis from 'ioredis';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Inject, Injectable, OnModuleDestroy, OnModuleInit, Optional } from '@nestjs/common';

import { RedisClient } from '@app/clients/redis';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { RedisBufferHandler } from '@app/handlers/buffer/redis';

import {
  ReactionBufferPort,
  REACTION_DATABASE_PORT,
  ReactionRepositoryPort,
} from '@reaction/application/ports';
import { ReactionAggregate } from '@reaction/domain/aggregates';
import { ReactionConfigService } from '@reaction/infrastructure/config';
import { TransportDomainReactionStatusEnumMapper } from '@reaction/infrastructure/anti-corruption';

import { ReactionMessage, StreamData } from '../types';

export interface RedisStreamConfig {
  key: string;
  groupName: string;
}

export const REDIS_BUFFER_CONFIG = Symbol('REDIS_BUFFER_CONFIG');

@Injectable()
export class RedisStreamBufferAdapter implements ReactionBufferPort, OnModuleInit, OnModuleDestroy {
  private readonly client: Redis;

  public constructor(
    private readonly configService: ReactionConfigService,

    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(REACTION_DATABASE_PORT)
    private readonly reactionRepo: ReactionRepositoryPort,

    private readonly redis: RedisClient,
    private readonly handler: RedisBufferHandler,

    @Optional()
    @Inject(REDIS_BUFFER_CONFIG)
    private readonly streamConfig?: RedisStreamConfig,
  ) {
    this.client = redis.getClient();
  }

  public async onModuleInit() {
    await this.handler.execute(async () => await this.connect(), {
      operationType: 'CONNECT',
    });
  }

  public async onModuleDestroy() {
    await this.handler.execute(async () => await this.disconnect(), {
      operationType: 'DISCONNECT',
    });
    await this.handler.execute(async () => await this.createStream(), { operationType: 'CONNECT' });
  }

  public async connect(): Promise<void> {
    await this.client.connect();
  }

  public async disconnect(): Promise<void> {
    await this.client.quit();
  }

  public async createStream() {
    if (!this.streamConfig) return;
    try {
      await this.client.xgroup(
        'CREATE',
        this.streamConfig.key,
        this.streamConfig.groupName,
        '0',
        'MKSTREAM',
      );

      this.logger.info(`Stream with key:${this.streamConfig.key} was created successfully`);
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('BUSYGROUP')) {
        this.logger.alert(
          `Stream with key: ${this.streamConfig.key} already exists, skipping creation`,
        );
      } else {
        throw err;
      }
    }
  }

  public async bufferReaction(reaction: ReactionAggregate): Promise<void> {
    await this.handler.execute(
      async () =>
        await this.client.xadd(
          this.configService.REDIS_STREAM_KEY,
          '*',
          'reaction-message',
          JSON.stringify(reaction),
        ),
      {
        operationType: 'SAVE',
        valueToBuffer: JSON.stringify(reaction),
      },
    );
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async processReactionsBatch() {
    const getStreamDataOperation = async () =>
      (await this.client.xreadgroup(
        'GROUP',
        this.configService.REDIS_STREAM_GROUPNAME,
        this.configService.REDIS_STREAM_CONSUMER_ID,
        'COUNT',
        10,
        'BLOCK',
        5000,
        'STREAMS',
        this.configService.REDIS_STREAM_KEY,
        '>',
      )) as StreamData[];

    const streamData = await this.handler.execute(getStreamDataOperation, {
      operationType: 'FLUSH',
    });

    if (!streamData || streamData.length === 0) {
      return 0;
    }

    const { ids, extractedMessages } = this.extractMessageFromStream(streamData);

    return await this.processMessages(ids, extractedMessages);
  }

  public extractMessageFromStream(stream: StreamData[]) {
    const messages: ReactionMessage[] = [];
    const ids: string[] = [];
    for (const [streamKey, entities] of stream) {
      this.logger.info(`Processing stream: ${streamKey}`);
      for (const [id, message] of entities) {
        this.logger.info(`Recieved an element with id:${id}`);
        ids.push(id);
        messages.push(JSON.parse(message[1]) as ReactionMessage);
      }
    }
    return { ids: ids, extractedMessages: messages };
  }

  public async processMessages(ids: string[], messages: ReactionMessage[]) {
    const models = messages.map((message) => {
      const reactionStatus = TransportDomainReactionStatusEnumMapper[message.reactionStatus];
      return ReactionAggregate.create({
        userId: message.userId,
        videoId: message.videoId,
        reactionStatus,
      });
    });

    const processedMessagesNumber = await this.reactionRepo.saveManyReaction(models);

    await this.handler.execute(
      async () =>
        await this.client.xack(
          this.configService.REDIS_STREAM_KEY,
          this.configService.REDIS_STREAM_GROUPNAME,
          ...ids,
        ),
      {
        operationType: 'FLUSH',
      },
    );

    return processedMessagesNumber;
  }
}
