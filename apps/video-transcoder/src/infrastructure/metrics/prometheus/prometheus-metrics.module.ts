import { Global, Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { videoTranscoderServiceRequestsCounter } from './counters/requests-counter';

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: { enabled: true },
    }),
  ],
  providers: [videoTranscoderServiceRequestsCounter],
  exports: [videoTranscoderServiceRequestsCounter],
})
export class PrometheusMetricsModule {}
