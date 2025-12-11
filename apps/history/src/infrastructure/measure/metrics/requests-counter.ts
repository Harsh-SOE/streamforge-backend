import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const historyServiceRequestsCounter = makeCounterProvider({
  name: 'total_requests_for_history',
  help: 'This metric will provide the total request recieved by the history service',
  labelNames: ['method', 'route', 'status_code'],
});
