import { Global, Module } from '@nestjs/common';

import { LOGGER_PORT } from '@app/common/ports/logger';
import { EVENT_CONSUMER_PORT } from '@app/common/ports/events';
import {
  KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
  KafkaEventConsumerHandler,
  KafkaEventConsumerHandlerConfig,
} from '@app/handlers/events-consumer/kafka';
import { LOKI_CONFIG, LokiConfig, LokiConsoleLogger } from '@app/utils/loki-console-logger';
import { KAFKA_CLIENT_CONFIG, KafkaClient, KafkaClientConfig } from '@app/clients/kafka';

import { MeasureModule } from '../measure';
import { EmailConfigModule, EmailConfigService } from '../config';
import { EmailKafkaEventsConsumerAdapter } from '../events-consumer/adapters';
import { EMAIL_PORT } from '@email/application/ports';
import { MailerSendEmailAdapter } from '../email';

@Global()
@Module({
  imports: [MeasureModule, EmailConfigModule],
  providers: [
    EmailConfigService,
    KafkaEventConsumerHandler,
    KafkaClient,
    {
      provide: EVENT_CONSUMER_PORT,
      useClass: EmailKafkaEventsConsumerAdapter,
    },
    { provide: LOGGER_PORT, useClass: LokiConsoleLogger },
    {
      provide: KAFKA_CLIENT_CONFIG,
      inject: [EmailConfigService],
      useFactory: (configService: EmailConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          clientId: configService.KAFKA_CLIENT_ID,
          caCert: configService.KAFKA_CA_CERT,
          accessKey: configService.ACCESS_KEY,
          accessCert: configService.ACCESS_CERT,
        }) satisfies KafkaClientConfig,
    },
    {
      provide: KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
      inject: [EmailConfigService],
      useFactory: (configService: EmailConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'email',
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
          dlqTopic: `dlq.email`,
        }) satisfies KafkaEventConsumerHandlerConfig,
    },
    {
      provide: LOKI_CONFIG,
      inject: [EmailConfigService],
      useFactory: (configService: EmailConfigService) =>
        ({ url: configService.GRAFANA_LOKI_URL }) satisfies LokiConfig,
    },
    {
      provide: EMAIL_PORT,
      useClass: MailerSendEmailAdapter,
    },
  ],
  exports: [
    KafkaEventConsumerHandler,
    KafkaClient,
    EVENT_CONSUMER_PORT,
    LOGGER_PORT,
    LOKI_CONFIG,
    KAFKA_CLIENT_CONFIG,
    KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
    EMAIL_PORT,
    EmailConfigService,
  ],
})
export class PlatformModule {}
