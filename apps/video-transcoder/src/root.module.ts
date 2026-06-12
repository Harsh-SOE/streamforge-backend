import { Module } from '@nestjs/common';

import { EventsListenerModule } from './presentation';
import { AppHealthModule } from './infrastructure/health';
import { CoreModule } from './infrastructure/core/core.module';

@Module({
  imports: [CoreModule, EventsListenerModule, AppHealthModule],
})
export class RootModule {}
