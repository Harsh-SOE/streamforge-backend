import { Module } from '@nestjs/common';

import { LOGGER_PORT } from '@app/ports/logger';

import { EMAIL_PORT } from '@email/application/ports';
import {
  AppConfigModule,
  AppConfigService,
} from '@email/infrastructure/config';
import { WinstonLoggerAdapter } from '@email/infrastructure/logger';
import { MailerSendEmailAdapter } from '@email/infrastructure/email';
import { MeasureModule } from '@email/infrastructure/measure';

@Module({
  imports: [AppConfigModule, MeasureModule],
  providers: [
    { provide: LOGGER_PORT, useClass: WinstonLoggerAdapter },
    { provide: EMAIL_PORT, useClass: MailerSendEmailAdapter },
    AppConfigService,
  ],
  exports: [LOGGER_PORT, EMAIL_PORT, AppConfigService],
})
export class KakfaModule {}
