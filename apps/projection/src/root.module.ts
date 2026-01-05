import { Module } from '@nestjs/common';

import { EventsModule } from './presentation/events/events.module';
import { AppHealthModule } from './infrastructure/health/health.module';
import { MeasureModule } from './infrastructure/measure';

@Module({
  imports: [EventsModule, AppHealthModule, MeasureModule],
})
export class RootModule {}
