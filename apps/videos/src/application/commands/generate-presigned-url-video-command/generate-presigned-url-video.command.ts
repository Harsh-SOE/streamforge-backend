import { GetPresignedUrlDto } from '@app/contracts/protocols/videos';

export class GeneratePreSignedUrlVideoCommand {
  public constructor(public readonly generatePreSignedUrlDto: GetPresignedUrlDto) {}
}
