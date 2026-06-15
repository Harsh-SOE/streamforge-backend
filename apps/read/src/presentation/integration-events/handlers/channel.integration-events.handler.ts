import { Inject, Injectable } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { ChannelCreatedIntegrationEvent } from '@app/contracts/events/channel';

import {
  CHANNEL_PROJECTION_REPOSITORY_PORT,
  ChannelProjectionRepositoryPort,
} from '@read/application/ports';

@Injectable()
export class ChannelIntegrationEventsHandler {
  public constructor(
    @Inject(CHANNEL_PROJECTION_REPOSITORY_PORT)
    private readonly channelProjectionRespository: ChannelProjectionRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public async onChannelCreated(channelCreatedIntegrationEvent: ChannelCreatedIntegrationEvent) {
    await this.channelProjectionRespository.saveChannel(channelCreatedIntegrationEvent.payload);
  }
}
