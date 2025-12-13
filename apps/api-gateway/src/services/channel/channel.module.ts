import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { SERVICES } from '@app/clients/constant';

import { AppConfigModule, AppConfigService } from '@gateway/infrastructure/config';
import { LOGGER_PORT } from '@app/ports/logger';
import { WinstonLoggerAdapter } from '@gateway/infrastructure/logger';
import { MeasureModule } from '@gateway/infrastructure/measure';

import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';

@Module({
  controllers: [ChannelController],
  imports: [
    AppConfigModule,
    MeasureModule,
    ClientsModule.registerAsync([
      {
        name: SERVICES.CHANNEL,
        imports: [AppConfigModule],
        inject: [AppConfigService],
        useFactory: (configService: AppConfigService) => configService.CHANNEL_SERVICE_OPTIONS,
      },
    ]),
  ],
  providers: [ChannelService, { provide: LOGGER_PORT, useClass: WinstonLoggerAdapter }],
})
export class ChannelModule {}
