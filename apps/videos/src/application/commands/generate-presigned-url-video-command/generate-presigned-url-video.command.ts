import { GetPresignedUrlDto } from '@app/contracts/videos';

export class GeneratePreSignedUrlVideoCommand {
  public constructor(public readonly generatePreSignedUrlDto: GetPresignedUrlDto) {}
}
