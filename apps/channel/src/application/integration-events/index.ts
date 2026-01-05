import { ChannelCreatedEventHandler } from './channel-created.handler';
import { ChannelUpdatedEventHandler } from './channel-updated.handler';
import { ChannelMonitizedEventHandler } from './channel-monitized.handler';

export const ChannelEventHandler = [
  ChannelCreatedEventHandler,
  ChannelMonitizedEventHandler,
  ChannelUpdatedEventHandler,
];
