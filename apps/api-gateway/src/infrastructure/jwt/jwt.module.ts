import { Global, Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';

import { LOGGER_PORT } from '@app/ports/logger';
import { SERVICES } from '@app/clients';

import {
  AppConfigModule,
  AppConfigService,
} from '@gateway/infrastructure/config';

import { JwtStrategy } from './jwt-strategies';
import { WinstonLoggerAdapter } from '../logger';

@Global()
@Module({
  imports: [
    AppConfigModule,
    JwtModule.registerAsync({
      inject: [AppConfigService],
      imports: [AppConfigModule],
      useFactory: (configService: AppConfigService) =>
        configService.JWT_TOKEN_OPTIONS,
    }),
    ClientsModule.registerAsync([
      {
        imports: [AppConfigModule],
        inject: [AppConfigService],
        name: SERVICES.USER,
        useFactory: (configService: AppConfigService) =>
          configService.USER_SERVICE_OPTIONS,
      },
    ]),
    ClientsModule.registerAsync([
      {
        imports: [AppConfigModule],
        inject: [AppConfigService],
        name: SERVICES.QUERY,
        useFactory: (configService: AppConfigService) =>
          configService.QUERY_SERVICE_OPTIONS,
      },
    ]),
  ],
  providers: [
    JwtStrategy,
    AppConfigService,
    { provide: LOGGER_PORT, useClass: WinstonLoggerAdapter },
  ],
  exports: [JwtStrategy, JwtModule],
})
export class AppJwtModule {}
