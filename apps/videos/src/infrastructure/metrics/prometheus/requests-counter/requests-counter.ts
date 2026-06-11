import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const videosServiceRequestsCounter = makeCounterProvider({
  name: 'total_requests_for_videos',
  help: 'This metric will provide the total request recieved by the videos service',
  labelNames: ['method', 'route', 'status_code'],
});
