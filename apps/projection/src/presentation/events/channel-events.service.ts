import { Inject, Injectable } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { ChannelCreatedIntegrationEvent } from '@app/common/events/channel';

import {
  CHANNEL_PROJECTION_REPOSITORY_PORT,
  ChannelProjectionRepositoryPort,
} from '@projection/application/ports';

@Injectable()
export class ChannelEventsService {
  public constructor(
    @Inject(CHANNEL_PROJECTION_REPOSITORY_PORT)
    private readonly channelProjectionRespository: ChannelProjectionRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public async onChannelCreated(channelCreatedIntegrationEvent: ChannelCreatedIntegrationEvent) {
    // Implementation for handling user profile created projection event
    this.logger.info(`saving user projection`);
    await this.channelProjectionRespository.saveChannel(channelCreatedIntegrationEvent);
  }
}
