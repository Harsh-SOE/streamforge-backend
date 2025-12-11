import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const emailServiceRequestsCounter = makeCounterProvider({
  name: 'total_requests_for_email',
  help: 'This metric will provide the total request recieved by the email service',
  labelNames: ['method', 'route', 'status_code'],
});
