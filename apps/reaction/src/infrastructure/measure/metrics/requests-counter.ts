import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const reactionServiceRequestsCounter = makeCounterProvider({
  name: 'total_requests_for_reaction',
  help: 'This metric will provide the total request recieved by the reaction service',
  labelNames: ['method', 'route', 'status_code'],
});
