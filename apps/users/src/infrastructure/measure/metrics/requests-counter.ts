import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const userRequestsCounter = makeCounterProvider({
  name: 'total_requests_for_user',
  help: 'This metric will provide the total request recieved by the user service',
  labelNames: ['method', 'route', 'status_code'],
});
