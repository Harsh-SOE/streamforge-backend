import { Module } from '@nestjs/common';

import { WatchService } from './views.service';
import { WatchController } from './views.controller';

@Module({
  controllers: [WatchController],
  providers: [WatchService],
})
export class WatchModule {}
