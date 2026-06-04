import { Module } from '@nestjs/common';

import { EventListenerModule } from '@transcoder/presentation';
import { TranscoderConfigModule } from '@transcoder/infrastructure/config';

import { AppHealthModule } from './infrastructure/health';

@Module({
  imports: [TranscoderConfigModule, EventListenerModule, AppHealthModule],
})
export class RootModule {}
