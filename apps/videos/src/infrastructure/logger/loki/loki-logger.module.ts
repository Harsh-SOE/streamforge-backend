import { Module } from '@nestjs/common';

import { LOGGER_PORT } from '@app/common/ports/logger';
import { LOKI_CONFIG, LokiConfig, LokiConsoleLogger } from '@app/utils/loki-console-logger';

import { VideosConfigService } from '@videos/infrastructure/config';

@Module({
  providers: [
    {
      provide: LOKI_CONFIG,
      inject: [VideosConfigService],
      useFactory: (configService: VideosConfigService) =>
        ({ url: configService.GRAFANA_LOKI_URL }) satisfies LokiConfig,
    },
    { provide: LOGGER_PORT, useClass: LokiConsoleLogger },
  ],
})
export class LokiLoggerModule {}
