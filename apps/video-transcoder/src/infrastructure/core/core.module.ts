import { CqrsModule } from '@nestjs/cqrs';
import { Global, Module } from '@nestjs/common';

import { REDIS_CLIENT_CONFIG, RedisClient, RedisClientConfig } from '@app/clients/redis';
import { KAFKA_CLIENT_CONFIG, KafkaClientConfig, KafkaClient } from '@app/clients/kafka';

import { LoggerModule } from '../logger';
import { MetricsModule } from '../metrics';
import { TranscoderConfigModule, TranscoderConfigService } from '../config';

@Global()
@Module({
  imports: [CqrsModule, MetricsModule, TranscoderConfigModule, LoggerModule],
  providers: [
    // clients and config
    KafkaClient,
    {
      provide: KAFKA_CLIENT_CONFIG,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          clientId: configService.KAFKA_CLIENT_ID,
          accessCert: configService.ACCESS_CERT,
          accessKey: configService.ACCESS_KEY,
          caCert: configService.KAFKA_CA_CERT,
        }) as KafkaClientConfig,
    },
    {
      provide: REDIS_CLIENT_CONFIG,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
        }) as RedisClientConfig,
    },
  ],
  exports: [
    CqrsModule,
    TranscoderConfigModule,
    MetricsModule,
    LoggerModule,
    KafkaClient,
    RedisClient,
  ],
})
export class CoreModule {}
