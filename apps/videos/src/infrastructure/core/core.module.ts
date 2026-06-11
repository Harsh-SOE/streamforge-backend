import { CqrsModule } from '@nestjs/cqrs';
import { Global, Module } from '@nestjs/common';

import { KAFKA_CLIENT_CONFIG, KafkaClientConfig, KafkaClient } from '@app/clients/kafka';
import { REDIS_CLIENT_CONFIG, RedisClientConfig, RedisClient } from '@app/clients/redis';

import { PrometheusMetricsModule } from '@videos/infrastructure/metrics/prometheus';
import { VideosConfigModule, VideosConfigService } from '@videos/infrastructure/config';

import { LokiLoggerModule } from '../logger/loki';

@Global()
@Module({
  imports: [PrometheusMetricsModule, VideosConfigModule, LokiLoggerModule, CqrsModule],
  providers: [
    RedisClient,
    {
      provide: REDIS_CLIENT_CONFIG,
      inject: [VideosConfigService],
      useFactory: (configService: VideosConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
        }) satisfies RedisClientConfig,
    },
    KafkaClient,
    {
      provide: KAFKA_CLIENT_CONFIG,
      inject: [VideosConfigService],
      useFactory: (configService: VideosConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          accessCert: configService.ACCESS_CERT,
          accessKey: configService.ACCESS_KEY,
          caCert: configService.KAFKA_CA_CERT,
          clientId: 'videos-service',
        }) satisfies KafkaClientConfig,
    },
  ],
  exports: [
    PrometheusMetricsModule,
    LokiLoggerModule,
    CqrsModule,
    VideosConfigModule,

    KafkaClient,
    RedisClient,
  ],
})
export class CoreModule {}
