import { JwtModule } from '@nestjs/jwt';
import { Global, Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { SERVICES } from '@app/clients';
import { LOGGER_PORT } from '@app/ports/logger';

import { MeasureModule } from '@gateway/infrastructure/measure';
import { WinstonLoggerAdapter } from '@gateway/infrastructure/logger';
import { JwtStrategy } from '@gateway/infrastructure/jwt/jwt-strategies';
import { AppConfigModule, AppConfigService } from '@gateway/infrastructure/config';

@Global()
@Module({
  imports: [
    MeasureModule,
    AppConfigModule,
    ClientsModule.registerAsync([
      {
        imports: [AppConfigModule],
        inject: [AppConfigService],
        name: SERVICES.USER,
        useFactory: (configService: AppConfigService) => configService.USER_SERVICE_OPTIONS,
      },
      {
        imports: [AppConfigModule],
        inject: [AppConfigService],
        name: SERVICES.CHANNEL,
        useFactory: (configService: AppConfigService) => configService.CHANNEL_SERVICE_OPTIONS,
      },
      {
        imports: [AppConfigModule],
        inject: [AppConfigService],
        name: SERVICES.QUERY,
        useFactory: (configService: AppConfigService) => configService.QUERY_SERVICE_OPTIONS,
      },
      {
        imports: [AppConfigModule],
        inject: [AppConfigService],
        name: SERVICES.COMMENTS,
        useFactory: (configService: AppConfigService) => configService.COMMENT_SERVICE_OPTIONS,
      },
      {
        imports: [AppConfigModule],
        inject: [AppConfigService],
        name: SERVICES.REACTION,
        useFactory: (configService: AppConfigService) => configService.REACTION_SERVICE_OPTIONS,
      },
      {
        imports: [AppConfigModule],
        inject: [AppConfigService],
        name: SERVICES.VIDEO,
        useFactory: (configService: AppConfigService) => configService.VIDEO_SERVICE_OPTIONS,
      },
      {
        imports: [AppConfigModule],
        inject: [AppConfigService],
        name: SERVICES.WATCH,
        useFactory: (configService: AppConfigService) => configService.WATCH_SERVICE_OPTION,
      },
    ]),
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.JWT_TOKEN_OPTIONS,
    }),
  ],
  providers: [
    JwtStrategy,
    AppConfigService,
    { provide: LOGGER_PORT, useClass: WinstonLoggerAdapter },
  ],
  exports: [LOGGER_PORT, JwtStrategy, MeasureModule, AppConfigService, ClientsModule, JwtModule],
})
export class GlobalEnvironmentModule {}
