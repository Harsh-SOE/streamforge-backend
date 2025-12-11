import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const authzServiceRequestsCounter = makeCounterProvider({
  name: 'total_requests_for_authz',
  help: 'This metric will provide the total request recieved by the authz service',
  labelNames: ['method', 'route', 'status_code'],
});
