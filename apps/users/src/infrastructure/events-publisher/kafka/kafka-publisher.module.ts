import { Module } from '@nestjs/common';

import {
  KAFKA_EVENT_PUBLISHER_HANDLER_CONFIG,
  KafkaEventPublisherHandler,
  KafkaEventPublisherHandlerConfig,
} from '@app/handlers/events-publisher/kafka';

import { UserConfigService } from '@users/infrastructure/config';
import { KafkaEventsConsumerAdapter } from '@users/infrastructure/events-consumer/kafka';

@Module({
  providers: [
    {
      provide: KAFKA_EVENT_PUBLISHER_HANDLER_CONFIG,
      inject: [UserConfigService],
      useFactory: (configService: UserConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'users',
          logErrors: true,
          resilienceOptions: {
            circuitBreakerThreshold: 50,
            halfOpenAfterMs: 10_000,
            maxRetries: 5,
          },
          enableDlq: true,
          dlqOnApplicationException: true,
          dlqOnDomainException: false,
          sendToDlqAfterAttempts: 5,
          dlqTopic: `dlq.users`,
        }) satisfies KafkaEventPublisherHandlerConfig,
    },
    KafkaEventPublisherHandler,
    KafkaEventsConsumerAdapter,
  ],
})
export class KafkaPublisherModule {}
