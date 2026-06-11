// TODO: fix potential double instances of the clients...
// TODO: make a kafka buffer handler as well
import { CqrsModule } from '@nestjs/cqrs';
import { Global, Module } from '@nestjs/common';

import { KAFKA_CLIENT_CONFIG, KafkaClient, KafkaClientConfig } from '@app/clients/kafka';
import { REDIS_CLIENT_CONFIG, RedisClient, RedisClientConfig } from '@app/clients/redis';

import { UserConfigModule, UserConfigService } from '@users/infrastructure/config';
import { PrometheusMetricsModule } from '@users/infrastructure/metrics/prometheus';
import { REDIS_BUFFER_CONFIG, RedisBufferConfig } from '@users/infrastructure/buffer/redis';

import { LoggerModule } from '../logger/loki';

@Global()
@Module({
  imports: [PrometheusMetricsModule, CqrsModule, UserConfigModule, LoggerModule],
  providers: [
    RedisClient,
    {
      provide: REDIS_CLIENT_CONFIG,
      inject: [UserConfigService],
      useFactory: (configService: UserConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
        }) satisfies RedisClientConfig,
    },
    {
      provide: REDIS_BUFFER_CONFIG,
      inject: [UserConfigService],
      useFactory: (configService: UserConfigService) =>
        ({
          groupName: configService.REDIS_STREAM_GROUPNAME,
          key: configService.REDIS_STREAM_KEY,
        }) satisfies RedisBufferConfig,
    },

    KafkaClient,
    {
      provide: KAFKA_CLIENT_CONFIG,
      inject: [UserConfigService],
      useFactory: (configService: UserConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          clientId: configService.KAFKA_CLIENT_ID,
          caCert: configService.KAFKA_CA_CERT,
          accessKey: configService.ACCESS_KEY,
          accessCert: configService.ACCESS_CERT,
        }) satisfies KafkaClientConfig,
    },
  ],
  exports: [PrometheusMetricsModule, CqrsModule, LoggerModule, KafkaClient, RedisClient],
})
export class CoreModule {}
