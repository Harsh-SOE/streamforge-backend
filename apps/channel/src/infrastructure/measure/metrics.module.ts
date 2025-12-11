import { Global, Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { channelServiceRequestsCounter } from './metrics/requests-counter';

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: { enabled: true },
    }),
  ],
  providers: [channelServiceRequestsCounter],
  exports: [channelServiceRequestsCounter],
})
export class MeasureModule {}
