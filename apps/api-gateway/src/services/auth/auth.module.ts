import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ClientsModule } from '@nestjs/microservices';

import { SERVICES } from '@app/clients/constant';
import { LOGGER_PORT } from '@app/ports/logger';

import { MeasureModule } from '@gateway/infrastructure/measure';
import {
  AppConfigModule,
  AppConfigService,
} from '@gateway/infrastructure/config';
import { WinstonLoggerAdapter } from '@gateway/infrastructure/logger';

import { Auth0Strategy } from './auth0-strategies';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  imports: [
    MeasureModule,
    AppConfigModule,
    PassportModule.register({ defaultStrategy: 'auth0', session: true }),
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
        name: SERVICES.QUERY,
        imports: [AppConfigModule],
        inject: [AppConfigService],
        useFactory: (configService: AppConfigService) =>
          configService.QUERY_SERVICE_OPTIONS,
      },
    ]),
  ],
  providers: [
    AuthService,
    Auth0Strategy,
    { provide: LOGGER_PORT, useClass: WinstonLoggerAdapter },
  ],
  exports: [Auth0Strategy],
})
export class AuthModule {}
