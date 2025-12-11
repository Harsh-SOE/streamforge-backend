import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const commentsServiceRequestsCounter = makeCounterProvider({
  name: 'total_requests_for_comments',
  help: 'This metric will provide the total request recieved by the comments service',
  labelNames: ['method', 'route', 'status_code'],
});
