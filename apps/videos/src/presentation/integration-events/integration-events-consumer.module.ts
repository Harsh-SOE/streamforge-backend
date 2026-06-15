import { Module } from '@nestjs/common';

import { INTEGRATION_EVENT_CONSUMER_PORT } from '@app/common/ports/events';

import { VIDEOS_RESPOSITORY_PORT } from '@videos/application/ports';
import { VideoPrismaRepositoryAdapter } from '@videos/infrastructure/database/prisma';
import { VideosDomainEventsHandler } from '@videos/application/domain-events-handler';
import { VideosKafkaConsumerAdapter } from '@videos/infrastructure/integration-events-consumer/kafka';

import { IntegrationEventsConsumerService } from './integration-events-consumer.service';
import { VideosIntegrationEventHandler } from './handlers/videos-integration-event.handler';

@Module({
  providers: [
    {
      provide: INTEGRATION_EVENT_CONSUMER_PORT,
      useClass: VideosKafkaConsumerAdapter,
    },
    {
      provide: VIDEOS_RESPOSITORY_PORT,
      useClass: VideoPrismaRepositoryAdapter,
    },
    IntegrationEventsConsumerService,
    VideosIntegrationEventHandler,
    ...VideosDomainEventsHandler,
  ],
})
export class IntegrationEventsConsumerModule {}
