import { Module } from '@nestjs/common';

import { AUTHORIZE_PORT } from '@authz/application/ports/auth';
import { OpenFGAAuthAdapter } from '@authz/infrastructure/auth/adapters';
import { WinstonLoggerAdapter } from '@authz/infrastructure/logger';
import {
  AppConfigModule,
  AppConfigService,
} from '@authz/infrastructure/config';

import { GrpcService } from './gprc.service';
import { GrpcController } from './gprc.controller';
import { LOGGER_PORT } from '@app/ports';

@Module({
  imports: [AppConfigModule],
  providers: [
    GrpcService,
    AppConfigService,
    { provide: AUTHORIZE_PORT, useClass: OpenFGAAuthAdapter },
    { provide: LOGGER_PORT, useClass: WinstonLoggerAdapter },
  ],
  controllers: [GrpcController],
})
export class GrpcModule {}
