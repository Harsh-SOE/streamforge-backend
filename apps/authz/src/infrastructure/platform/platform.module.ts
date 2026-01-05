import { Global, Module } from '@nestjs/common';

import { LOGGER_PORT } from '@app/common/ports/logger';
import { AUTHORIZE_PORT } from '@authz/application/ports/auth';
import { LOKI_CONFIG, LokiConfig, LokiConsoleLogger } from '@app/utils/loki-console-logger';

import { AuthzConfigService } from '../config';
import { OpenFGAAuthAdapter } from '../auth/adapters';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: LOKI_CONFIG,
      inject: [AuthzConfigService],
      useFactory: (configService: AuthzConfigService) =>
        ({ url: configService.GRAFANA_LOKI_URL }) satisfies LokiConfig,
    },
    AuthzConfigService,
    { provide: AUTHORIZE_PORT, useClass: OpenFGAAuthAdapter },
    { provide: LOGGER_PORT, useClass: LokiConsoleLogger },
  ],
  exports: [AuthzConfigService, AUTHORIZE_PORT, LOGGER_PORT],
})
export class PlatformModule {}
