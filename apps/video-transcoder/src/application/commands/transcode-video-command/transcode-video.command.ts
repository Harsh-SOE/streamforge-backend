import { TranscodeVideoMessage } from '@app/contracts/video-transcoder';

export class TranscodeVideoCommand {
  public constructor(public readonly transcodeVideoDto: TranscodeVideoMessage) {}
}
