import { Global, Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';

import { SERVICES } from '@app/clients';

import {
  AppConfigModule,
  AppConfigService,
} from '@gateway/infrastructure/config';

import { JwtStrategy } from './jwt-strategies';

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
  ],
  providers: [JwtStrategy, AppConfigService],
  exports: [JwtStrategy, JwtModule],
})
export class AppJwtModule {}
