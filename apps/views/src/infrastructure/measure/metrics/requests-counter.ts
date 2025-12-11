import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const viewsServiceRequestsCounter = makeCounterProvider({
  name: 'total_requests_for_views',
  help: 'This metric will provide the total request recieved by the views service',
  labelNames: ['method', 'route', 'status_code'],
});
