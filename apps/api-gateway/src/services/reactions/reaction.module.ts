import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { SERVICES } from '@app/clients/constant';
import { LOGGER_PORT } from '@app/ports/logger';

import { AppConfigModule, AppConfigService } from '@gateway/infrastructure/config';
import { WinstonLoggerAdapter } from '@gateway/infrastructure/logger';
import { MeasureModule } from '@gateway/infrastructure/measure';

import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';

@Module({
  controllers: [ReactionController],
  imports: [
    AppConfigModule,
    MeasureModule,
    ClientsModule.registerAsync([
      {
        name: SERVICES.REACTION,
        imports: [AppConfigModule],
        inject: [AppConfigService],
        useFactory: (configService: AppConfigService) => configService.REACTION_SERVICE_OPTIONS,
      },
    ]),
  ],
  providers: [ReactionService, { provide: LOGGER_PORT, useClass: WinstonLoggerAdapter }],
})
export class ReactionModule {}
