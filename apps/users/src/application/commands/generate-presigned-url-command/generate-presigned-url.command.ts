import { GetPresignedUrlDto } from '@app/contracts/users';

export class GeneratePreSignedUrlCommand {
  public constructor(public readonly generatePreSignedUrlDto: GetPresignedUrlDto) {}
}
