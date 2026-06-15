import { Module } from '@nestjs/common';

import { EVENT_CONSUMER_PORT } from '@app/common/ports/events';

import { VideosEventsHandler } from '@videos/application/event-handlers';
import { VIDEOS_RESPOSITORY_PORT } from '@videos/application/ports';
import { VideoRepositoryAdapter } from '@videos/infrastructure/database/prisma';
import { VideosKafkaConsumerAdapter } from '@videos/infrastructure/events-consumer/kafka';

import { IntegrationEventsListener } from './integration-events-listener';
import { IntegrationEventsConsumer } from './integration-events-consumer';

@Module({
  providers: [
    {
      provide: EVENT_CONSUMER_PORT,
      useClass: VideosKafkaConsumerAdapter,
    },
    {
      provide: VIDEOS_RESPOSITORY_PORT,
      useClass: VideoRepositoryAdapter,
    },
    IntegrationEventsConsumer,
    IntegrationEventsListener,
    ...VideosEventsHandler,
  ],
})
export class EventsModule {}
