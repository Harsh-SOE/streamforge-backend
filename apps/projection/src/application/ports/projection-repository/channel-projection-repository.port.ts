import { ChannelCreatedEventDto } from '@app/contracts/channel';

export interface ChannelProjectionRepositoryPort {
  saveChannel(data: ChannelCreatedEventDto): Promise<boolean>;

  saveManyChannels(data: ChannelCreatedEventDto[]): Promise<number>;

  updateChannel(videoId: string, data: Partial<ChannelCreatedEventDto>): Promise<boolean>;

  deleteChannel(videoId: string): Promise<boolean>;
}

export const CHANNEL_PROJECTION_REPOSITORY_PORT = Symbol('CHANNEL_PROJECTION_REPOSITORY_PORT');
