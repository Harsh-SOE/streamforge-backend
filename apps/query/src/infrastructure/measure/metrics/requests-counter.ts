import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const queryServiceRequestsCounter = makeCounterProvider({
  name: 'total_requests_for_query',
  help: 'This metric will provide the total request recieved by the query service',
  labelNames: ['method', 'route', 'status_code'],
});
