import { JwtModule } from '@nestjs/jwt';
import { Global, Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { SERVICES } from '@app/common';
import { LOGGER_PORT } from '@app/common/ports/logger';
import { LOKI_CONFIG, LokiConfig, LokiConsoleLogger } from '@app/utils/loki-console-logger';

import { MeasureModule } from '@gateway/infrastructure/measure';
import { JwtStrategy } from '@gateway/infrastructure/jwt/jwt-strategies';
import { GatwayConfigModule, GatewayConfigService } from '@gateway/infrastructure/config';

@Global()
@Module({
  imports: [
    MeasureModule,
    GatwayConfigModule,
    ClientsModule.registerAsync([
      {
        imports: [GatwayConfigModule],
        inject: [GatewayConfigService],
        name: SERVICES.USER,
        useFactory: (configService: GatewayConfigService) => configService.USER_SERVICE_OPTIONS,
      },
      {
        imports: [GatwayConfigModule],
        inject: [GatewayConfigService],
        name: SERVICES.CHANNEL,
        useFactory: (configService: GatewayConfigService) => configService.CHANNEL_SERVICE_OPTIONS,
      },
      {
        imports: [GatwayConfigModule],
        inject: [GatewayConfigService],
        name: SERVICES.QUERY,
        useFactory: (configService: GatewayConfigService) => configService.QUERY_SERVICE_OPTIONS,
      },
      {
        imports: [GatwayConfigModule],
        inject: [GatewayConfigService],
        name: SERVICES.COMMENTS,
        useFactory: (configService: GatewayConfigService) => configService.COMMENT_SERVICE_OPTIONS,
      },
      {
        imports: [GatwayConfigModule],
        inject: [GatewayConfigService],
        name: SERVICES.REACTION,
        useFactory: (configService: GatewayConfigService) => configService.REACTION_SERVICE_OPTIONS,
      },
      {
        imports: [GatwayConfigModule],
        inject: [GatewayConfigService],
        name: SERVICES.VIDEO,
        useFactory: (configService: GatewayConfigService) => configService.VIDEO_SERVICE_OPTIONS,
      },
      {
        imports: [GatwayConfigModule],
        inject: [GatewayConfigService],
        name: SERVICES.WATCH,
        useFactory: (configService: GatewayConfigService) => configService.WATCH_SERVICE_OPTION,
      },
    ]),
    JwtModule.registerAsync({
      imports: [GatwayConfigModule],
      inject: [GatewayConfigService],
      useFactory: (configService: GatewayConfigService) => configService.JWT_TOKEN_OPTIONS,
    }),
  ],
  providers: [
    {
      provide: LOKI_CONFIG,
      inject: [GatewayConfigService],
      useFactory: (configService: GatewayConfigService) =>
        ({ url: configService.GRAFANA_LOKI_URL }) satisfies LokiConfig,
    },
    JwtStrategy,
    GatewayConfigService,
    { provide: LOGGER_PORT, useClass: LokiConsoleLogger },
  ],
  exports: [
    JwtStrategy,
    MeasureModule,
    GatewayConfigService,
    ClientsModule,
    JwtModule,
    LOGGER_PORT,
  ],
})
export class PlatformModule {}
