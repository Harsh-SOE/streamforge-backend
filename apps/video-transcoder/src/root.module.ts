import { Module } from '@nestjs/common';

import { EventListenerModule } from './presentation';
import { AppHealthModule } from './infrastructure/health';
import { CoreModule } from './infrastructure/core/core.module';

@Module({
  imports: [CoreModule, EventListenerModule, AppHealthModule],
})
export class RootModule {}
