import { Global, Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { playlistServiceRequestsCounter } from './metrics/requests-counter';

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: { enabled: true },
    }),
  ],
  providers: [playlistServiceRequestsCounter],
  exports: [playlistServiceRequestsCounter],
})
export class MeasureModule {}
