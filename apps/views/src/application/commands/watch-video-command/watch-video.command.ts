import { ViewsVideoDto } from '@app/contracts/views';

export class WatchVideoCommand {
  public constructor(public readonly watchVideoDto: ViewsVideoDto) {}
}
