import { Module } from '@nestjs/common';

import {
  UsersIntergrationEventsHandler,
  VideosIntegrationEventsHandler,
  ChannelIntegrationEventsHandler,
} from './handlers';
import { IntergrationEventsListenerService } from './intergration-events-listener.service';

@Module({
  providers: [
    IntergrationEventsListenerService,
    UsersIntergrationEventsHandler,
    ChannelIntegrationEventsHandler,
    VideosIntegrationEventsHandler,
  ],
})
export class IntegrationEventsModule {}
