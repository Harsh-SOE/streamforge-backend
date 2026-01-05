import {
  ChannelCreatedIntegrationEvent,
  ChannelUpdatedIntegrationEvent,
} from '@app/common/events/channel';

export interface ChannelProjectionRepositoryPort {
  saveChannel(data: ChannelCreatedIntegrationEvent): Promise<boolean>;

  saveManyChannels(data: ChannelCreatedIntegrationEvent[]): Promise<number>;

  updateChannel(videoId: string, data: Partial<ChannelUpdatedIntegrationEvent>): Promise<boolean>;

  deleteChannel(videoId: string): Promise<boolean>;
}

export const CHANNEL_PROJECTION_REPOSITORY_PORT = Symbol('CHANNEL_PROJECTION_REPOSITORY_PORT');
