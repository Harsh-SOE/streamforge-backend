import { ViewsVideoDto } from '@app/contracts/protocols/views';

export class WatchVideoCommand {
  public constructor(public readonly watchVideoDto: ViewsVideoDto) {}
}
