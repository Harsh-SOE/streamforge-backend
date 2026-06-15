import { Module } from '@nestjs/common';

import {
  KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
  KafkaEventConsumerHandler,
  KafkaEventConsumerHandlerConfig,
} from '@app/handlers/events-consumer/kafka';
import { INTEGRATION_EVENT_CONSUMER_PORT } from '@app/common/ports/events';

import { TranscoderConfigService } from '@transcoder/infrastructure/config';

import { TranscoderKafkaConsumerAdapter } from './kafka.adapter';

@Module({
  providers: [
    {
      provide: INTEGRATION_EVENT_CONSUMER_PORT,
      useClass: TranscoderKafkaConsumerAdapter,
    },
    {
      provide: KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
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
        }) satisfies KafkaEventConsumerHandlerConfig,
    },
    KafkaEventConsumerHandler,
  ],
  exports: [INTEGRATION_EVENT_CONSUMER_PORT],
})
export class KafkaConsumerModule {}
