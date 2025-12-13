import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ViewsVideoDto, ViewsVideoResponse } from '@app/contracts/views';

import { WatchVideoCommand } from '@views/application/commands';

@Injectable()
export class GrpcService {
  public constructor(public readonly commandBus: CommandBus) {}

  public async watchVideo(watchVideoDto: ViewsVideoDto): Promise<ViewsVideoResponse> {
    return this.commandBus.execute<WatchVideoCommand, ViewsVideoResponse>(
      new WatchVideoCommand(watchVideoDto),
    );
  }
}
