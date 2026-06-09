import { GetPresignedUrlDto } from '@app/contracts/protocols/channel';

export class GeneratePreSignedUrlCommand {
  public constructor(public readonly generatePreSignedUrlDto: GetPresignedUrlDto) {}
}
