import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const projectionServiceRequestsCounter = makeCounterProvider({
  name: 'total_requests_for_projection',
  help: 'This metric will provide the total request recieved by the projection service',
  labelNames: ['method', 'route', 'status_code'],
});
