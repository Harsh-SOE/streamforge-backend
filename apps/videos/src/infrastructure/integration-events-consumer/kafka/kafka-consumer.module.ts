import { Module } from '@nestjs/common';

import {
  KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
  KafkaEventConsumerHandler,
  KafkaEventConsumerHandlerConfig,
} from '@app/handlers/events-consumer/kafka';

import { VideosConfigService } from '@videos/infrastructure/config';

@Module({
  providers: [
    {
      provide: KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
      inject: [VideosConfigService],
      useFactory: (configService: VideosConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'videos',
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
          dlqTopic: `dlq.videos`,
        }) satisfies KafkaEventConsumerHandlerConfig,
    },
    KafkaEventConsumerHandler,
  ],
})
export class KafkaConsumerModule {}
