import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const channelServiceRequestsCounter = makeCounterProvider({
  name: 'total_requests_for_channel',
  help: 'This metric will provide the total request recieved by the channel service',
  labelNames: ['method', 'route', 'status_code'],
});
