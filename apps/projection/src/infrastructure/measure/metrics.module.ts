import { Global, Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { projectionServiceRequestsCounter } from './metrics/requests-counter';

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: { enabled: true },
    }),
  ],
  providers: [projectionServiceRequestsCounter],
  exports: [projectionServiceRequestsCounter],
})
export class MeasureModule {}
