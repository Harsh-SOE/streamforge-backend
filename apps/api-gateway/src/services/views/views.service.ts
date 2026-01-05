import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { SERVICES } from '@app/common';
import { VIEWS_SERVICE_NAME, ViewsServiceClient } from '@app/contracts/views';

import { ViewsVideoResponse } from './response';

@Injectable()
export class WatchService implements OnModuleInit {
  private watchService: ViewsServiceClient;

  constructor(@Inject(SERVICES.WATCH) private watchClient: ClientGrpc) {}

  onModuleInit() {
    this.watchService = this.watchClient.getService(VIEWS_SERVICE_NAME);
  }

  public async watchVideo(videoId: string, userId: string): Promise<ViewsVideoResponse> {
    const response$ = this.watchService.viewVideo({
      userId: userId,
      videoId: videoId,
    });
    return await firstValueFrom(response$);
  }
}
