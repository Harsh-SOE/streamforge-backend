import Redis from 'ioredis';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Inject, Injectable, OnModuleDestroy, OnModuleInit, Optional } from '@nestjs/common';

import { RedisClient } from '@app/clients/redis';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { RedisBufferHandler } from '@app/handlers/buffer/redis';

import { UserAggregate } from '@users/domain/aggregates';
import { UserConfigService } from '@users/infrastructure/config';
import { USER_REROSITORY_PORT, UsersBufferPort } from '@users/application/ports';
import { UserRepositoryAdapter } from '@users/infrastructure/repository/adapters';

import { UserMessage, StreamData } from '../types';

export interface RedisBufferConfig {
  key: string;
  groupName: string;
}

export const REDIS_BUFFER_CONFIG = Symbol('REDIS_STREAM_CONFIG');

@Injectable()
export class UsersRedisBuffer implements UsersBufferPort, OnModuleInit, OnModuleDestroy {
  private client: Redis;

  public constructor(
    private readonly configService: UserConfigService,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,

    @Inject(USER_REROSITORY_PORT)
    private readonly usersRepository: UserRepositoryAdapter,

    private readonly redis: RedisClient,
    private readonly handler: RedisBufferHandler,

    @Optional()
    @Inject(REDIS_BUFFER_CONFIG)
    private readonly streamConfig?: RedisBufferConfig,
  ) {
    this.client = redis.getClient();
    this.logger.alert(`Using Redis stream as buffer for users service`);
  }

  public async connect(): Promise<void> {
    this.logger.alert(`Redis buffer connecting...`);
    await this.client.connect();
    this.logger.alert(`Redis buffer connected successfully!`);
  }

  public async disconnect(): Promise<void> {
    this.logger.alert(`Redis buffer disconnecting...`);
    await this.client.quit();
    this.logger.alert(`Redis buffer disconnected successfully!`);
  }

  public async onModuleInit() {
    await this.handler.execute(async () => await this.connect(), { operationType: 'CONNECT' });
    await this.handler.execute(async () => await this.createStream(), { operationType: 'CONNECT' });
  }

  public async onModuleDestroy() {
    await this.handler.execute(async () => await this.disconnect(), {
      operationType: 'DISCONNECT',
    });
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

  public async bufferUser(user: UserAggregate): Promise<void> {
    const addToBufferOperation = async () =>
      await this.client.xadd(
        this.configService.REDIS_STREAM_KEY,
        '*',
        'user-message',
        JSON.stringify(user.getUserSnapshot()),
      );
    await this.handler.execute(addToBufferOperation, {
      operationType: 'SAVE',
      valueToBuffer: JSON.stringify(user.getUserSnapshot()),
    });
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async processUsersBatch() {
    this.logger.alert(`Processing user in batches now`);

    const readStreamOperation = async () => {
      const streamData = await this.client.xreadgroup(
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
      );
      return streamData as StreamData[];
    };

    const streamData = await this.handler.execute(readStreamOperation, { operationType: 'FLUSH' });

    if (!streamData || streamData.length === 0) {
      return 0;
    }

    const { ids, extractedMessages } = this.extractMessageFromStream(streamData);

    return await this.processMessages(ids, extractedMessages);
  }

  public extractMessageFromStream(stream: StreamData[]) {
    const messages: UserMessage[] = [];
    const ids: string[] = [];
    for (const [streamKey, entities] of stream) {
      this.logger.info(`Processing stream: ${streamKey}`);
      for (const [id, message] of entities) {
        this.logger.info(`Recieved an element with id:${id}`);
        ids.push(id);
        messages.push(JSON.parse(message[1]) as UserMessage);
      }
    }
    return { ids: ids, extractedMessages: messages };
  }

  public async processMessages(ids: string[], messages: UserMessage[]) {
    const models = messages.map((message) => {
      return UserAggregate.create({
        id: message.id,
        email: message.email,
        handle: message.handle,
        avatarUrl: message.avatarUrl,
        userAuthId: message.userAuthId,
        dob: message.dob ? new Date(message.dob) : undefined,
        phoneNumber: message.phoneNumber,
        isPhoneNumberVerified: message.isPhoneNumbetVerified,
        notification: message.notification,
        preferredLanguage: message.languagePreference,
        preferredTheme: message.themePreference,
        region: message.region,
      });
    });

    const processedMessagesNumber = await this.usersRepository.saveManyUsers(models);

    const acknowlegdementOperation = async () =>
      await this.client.xack(
        this.configService.REDIS_STREAM_KEY,
        this.configService.REDIS_STREAM_GROUPNAME,
        ...ids,
      );

    await this.handler.execute(acknowlegdementOperation, { operationType: 'FLUSH' });

    return processedMessagesNumber;
  }
}
