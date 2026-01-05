import { Module } from '@nestjs/common';

import { EventsModule } from './presentation/events/events.module';
import { EmailConfigModule } from './infrastructure/config/config.module';
import { MeasureModule } from './infrastructure/measure';
import { AppHealthModule } from './infrastructure/health';
import { PlatformModule } from './infrastructure/platform/platform.module';

@Module({
  imports: [EventsModule, EmailConfigModule, MeasureModule, AppHealthModule, PlatformModule],
})
export class RootModule {}
