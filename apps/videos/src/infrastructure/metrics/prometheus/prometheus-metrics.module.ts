import { Global, Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { videosServiceRequestsCounter } from './requests-counter/requests-counter';

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: { enabled: true },
    }),
  ],
  providers: [videosServiceRequestsCounter],
  exports: [videosServiceRequestsCounter],
})
export class PrometheusMetricsModule {}
