import { Global, Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { viewsServiceRequestsCounter } from './metrics/requests-counter';

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: { enabled: true },
    }),
  ],
  providers: [viewsServiceRequestsCounter],
  exports: [viewsServiceRequestsCounter],
})
export class MeasureModule {}
