import { GetPresignedUrlDto } from '@app/contracts/channel';

export class GeneratePreSignedUrlCommand {
  public constructor(public readonly generatePreSignedUrlDto: GetPresignedUrlDto) {}
}
