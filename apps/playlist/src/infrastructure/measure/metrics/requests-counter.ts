import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const playlistServiceRequestsCounter = makeCounterProvider({
  name: 'total_requests_for_playlist',
  help: 'This metric will provide the total request recieved by the playlist service',
  labelNames: ['method', 'route', 'status_code'],
});
