import { Module } from '@nestjs/common';

import { LOGGER_PORT } from '@app/common/ports/logger';
import { LOKI_CONFIG, LokiConfig, LokiConsoleLogger } from '@app/utils/loki-console-logger';

import { TranscoderConfigService } from '@transcoder/infrastructure/config';

@Module({
  providers: [
    { provide: LOGGER_PORT, useClass: LokiConsoleLogger },
    {
      provide: LOKI_CONFIG,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) =>
        ({ url: configService.GRAFANA_LOKI_URL }) satisfies LokiConfig,
    },
  ],
  exports: [LOGGER_PORT],
})
export class LokiLoggerModule {}
