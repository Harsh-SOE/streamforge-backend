import { Controller, Param, Post, UseGuards, Version } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

import { User } from '@gateway/common/decorators';
import { COMMENT_API_VERSION, VIEWS_API_ENDPOINT } from '@gateway/common/endpoints';
import { REQUESTS_COUNTER } from '@gateway/infrastructure/measure';
import { GatewayJwtGuard } from '@gateway/infrastructure/jwt/guard';

import { UserAuthPayload } from '@app/contracts/auth';

import { WatchService } from './views.service';
import { ViewsVideoResponse } from './response';

@Controller(VIEWS_API_ENDPOINT.ROOT)
@UseGuards(GatewayJwtGuard)
export class WatchController {
  constructor(
    private watchService: WatchService,
    @InjectMetric(REQUESTS_COUNTER) private readonly counter: Counter,
  ) {}

  @Post(VIEWS_API_ENDPOINT.VIEW_VIDEO)
  @Version(COMMENT_API_VERSION.VERSION_1)
  watchVideo(
    @Param('videoid') videoId: string,
    @User() user: UserAuthPayload,
  ): Promise<ViewsVideoResponse> {
    this.counter.inc();
    return this.watchService.watchVideo(videoId, user.id);
  }
}
