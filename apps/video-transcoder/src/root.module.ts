import { Module } from '@nestjs/common';

import { EventListenerModule } from './presentation';
import { AppHealthModule } from './infrastructure/health';
import { PlatformModule } from './infrastructure/platform/platform.module';

@Module({
  imports: [PlatformModule, EventListenerModule, AppHealthModule],
})
export class RootModule {}
