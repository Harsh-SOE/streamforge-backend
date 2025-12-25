import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { RedisClient } from '@app/clients/redis';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import { UserAggregate } from '@users/domain/aggregates';
import { UserConfigService } from '@users/infrastructure/config';
import { USER_REROSITORY_PORT, UsersBufferPort } from '@users/application/ports';
import { UserRepositoryAdapter } from '@users/infrastructure/repository/adapters';

import { UserMessage, StreamData } from '../types';

@Injectable()
export class UsersRedisBuffer implements UsersBufferPort {
  public constructor(
    private readonly configService: UserConfigService,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(USER_REROSITORY_PORT)
    private readonly usersRepository: UserRepositoryAdapter,
    private readonly redisBufferClient: RedisClient,
  ) {
    this.logger.alert(`Using Redis stream as buffer for users service`);
  }

  public async bufferUser(user: UserAggregate): Promise<void> {
    await this.redisBufferClient.client.xadd(
      this.configService.REDIS_STREAM_KEY,
      '*',
      'user-message',
      JSON.stringify(user.getUserSnapshot()),
    );
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async processUsersBatch() {
    this.logger.alert(`Processing user in batches now`);

    const streamData = (await this.redisBufferClient.client.xreadgroup(
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

    await this.redisBufferClient.client.xack(
      this.configService.REDIS_STREAM_KEY,
      this.configService.REDIS_STREAM_GROUPNAME,
      ...ids,
    );

    return processedMessagesNumber;
  }
}
