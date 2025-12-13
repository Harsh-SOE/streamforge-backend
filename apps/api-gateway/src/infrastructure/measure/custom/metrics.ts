import { makeHistogramProvider, makeCounterProvider } from '@willsoto/nestjs-prometheus';

import { REQUEST_PROCESSING_TIME, REQUESTS_COUNTER } from './constants';

export const requestTimer = makeHistogramProvider({
  name: REQUEST_PROCESSING_TIME,
  help: 'This metric tells the total time that it takes for a request made by the client to finally return the response',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [1, 20, 50, 100, 200, 300, 500, 1000, 2000, 3000],
});

export const requestCounter = makeCounterProvider({
  name: REQUESTS_COUNTER,
  help: 'This metrics will provide the count of total request request recieved by the gateway',
  labelNames: ['method', 'route', 'status_code'],
});
