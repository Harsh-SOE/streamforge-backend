import { GetPresignedUrlDto } from '@app/contracts/protocols/videos';

export class GeneratePreSignedUrlThumbnailCommand {
  public constructor(public readonly generatePreSignedUrlDto: GetPresignedUrlDto) {}
}
