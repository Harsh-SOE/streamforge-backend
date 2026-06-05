import { CqrsModule } from '@nestjs/cqrs';
import { Global, Module } from '@nestjs/common';

import { KAFKA_CLIENT_CONFIG, KafkaClientConfig, KafkaClient } from '@app/clients/kafka';

import { LoggerModule } from '../logger';
import { MeasureModule } from '../measure';
import { SegmentWatcher } from '../segment-watcher';
import { TranscoderConfigModule, TranscoderConfigService } from '../config';

@Global()
@Module({
  imports: [CqrsModule, MeasureModule, TranscoderConfigModule, LoggerModule],
  providers: [
    SegmentWatcher,
    TranscoderConfigService,

    // clients
    KafkaClient,

    // clients config
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
  ],
  exports: [
    CqrsModule,
    MeasureModule,
    LoggerModule,
    KafkaClient,
    SegmentWatcher,
    TranscoderConfigModule,
    TranscoderConfigService,
    KAFKA_CLIENT_CONFIG,
  ],
})
export class PlatformModule {}
