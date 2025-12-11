import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const subscribeServiceRequestsCounter = makeCounterProvider({
  name: 'total_requests_for_subscribe',
  help: 'This metric will provide the total request recieved by the subscribe service',
  labelNames: ['method', 'route', 'status_code'],
});
