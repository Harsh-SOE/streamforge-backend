import { GetPresignedUrlDto } from '@app/contracts/videos';

export class GeneratePreSignedUrlThumbnailCommand {
  public constructor(public readonly generatePreSignedUrlDto: GetPresignedUrlDto) {}
}
