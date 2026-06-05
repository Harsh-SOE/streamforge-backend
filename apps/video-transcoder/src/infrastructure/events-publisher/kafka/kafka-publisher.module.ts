import { Module } from '@nestjs/common';

import {
  KAFKA_EVENT_PUBLISHER_HANDLER_CONFIG,
  KafkaEventPublisherHandler,
  KafkaEventPublisherHandlerConfig,
} from '@app/handlers/events-publisher/kafka';
import { EVENT_PUBLISHER_PORT } from '@app/common/ports/events';

import { TranscoderConfigService } from '@transcoder/infrastructure/config';

import { TranscoderKafkaPublisherAdapter } from './adapters';

@Module({
  imports: [],
  providers: [
    KafkaEventPublisherHandler,
    {
      provide: EVENT_PUBLISHER_PORT,
      useClass: TranscoderKafkaPublisherAdapter,
    },
    {
      provide: KAFKA_EVENT_PUBLISHER_HANDLER_CONFIG,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'transcoder',
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
        }) satisfies KafkaEventPublisherHandlerConfig,
    },
  ],
  exports: [EVENT_PUBLISHER_PORT],
})
export class KafkaPublisherModule {}
