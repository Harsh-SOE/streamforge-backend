import { Histogram } from 'prom-client';
import responseTime from 'response-time';
import { NextFunction, Request, Response } from 'express';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Injectable, NestMiddleware } from '@nestjs/common';

import { REQUEST_PROCESSING_TIME } from '../../infrastructure/measure';

@Injectable()
export class ResponseTimeMiddleware implements NestMiddleware {
  private readonly handler: (req: Request, res: Response, next: NextFunction) => void;

  constructor(
    @InjectMetric(REQUEST_PROCESSING_TIME)
    private readonly metric: Histogram<'method' | 'route' | 'status_code'>,
  ) {
    this.handler = responseTime((req: Request, res: Response, time: number) => {
      const route = req.baseUrl + req.path;
      this.metric.labels(req.method, route, res.statusCode.toString()).observe(time);
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.handler(req, res, () => {}); // manually run middleware
    next(); // continue to next middleware
  }
}
