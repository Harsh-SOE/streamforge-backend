import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const videoTranscoderServiceRequestsCounter = makeCounterProvider({
  name: 'total_requests_for_video_transcoder',
  help: 'This metric will provide the total request recieved by the video transcoder service',
  labelNames: ['method', 'route', 'status_code'],
});
