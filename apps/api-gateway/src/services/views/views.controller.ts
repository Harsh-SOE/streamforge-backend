import { Controller, Param, Post, UseGuards, Version } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

import { GatewayJwtGuard } from '@gateway/infrastructure/jwt/guard';
import { REQUESTS_COUNTER } from '@gateway/infrastructure/measure';
import { User } from '@gateway/services/auth/decorators';

import { UserAuthPayload } from '@app/contracts/auth';

import { VIEWS_API } from './api';
import { WatchService } from './views.service';
import { ViewsVideoResponse } from './response';
import { COMMENT_API_VERSION } from '../comments/api';

@Controller('view')
@UseGuards(GatewayJwtGuard)
export class WatchController {
  constructor(
    private watchService: WatchService,
    @InjectMetric(REQUESTS_COUNTER) private readonly counter: Counter,
  ) {}

  @Post(VIEWS_API.VIEW_VIDEO)
  @Version(COMMENT_API_VERSION.V1)
  watchVideo(
    @Param('videoId') videoId: string,
    @User() user: UserAuthPayload,
  ): Promise<ViewsVideoResponse> {
    this.counter.inc();
    return this.watchService.watchVideo(videoId, user.id);
  }
}
