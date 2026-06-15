import { Module } from '@nestjs/common';

import { IntegrationEventsListenerModule } from './presentation';
import { AppHealthModule } from './infrastructure/health';
import { CoreModule } from './infrastructure/core/core.module';

@Module({
  imports: [CoreModule, IntegrationEventsListenerModule, AppHealthModule],
})
export class RootModule {}
