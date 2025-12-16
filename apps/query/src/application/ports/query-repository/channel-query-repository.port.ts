import { ChannelQueryModel } from '@query/queries/models';

export interface ChannelQueryRepositoryPort {
  getChannelFromId(channelId: string): Promise<ChannelQueryModel | null>;
  getChannelFromUserId(userId: string): Promise<ChannelQueryModel | null>;
}

export const CHANNEL_QUERY_REPOSITORY_PORT = Symbol('CHANNEL_QUERY_REPOSITORY_PORT');
