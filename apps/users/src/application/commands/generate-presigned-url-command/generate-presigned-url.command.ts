import { GetPresignedUrlDto } from '@app/contracts/protocols/users';

export class GeneratePreSignedUrlCommand {
  public constructor(public readonly generatePreSignedUrlDto: GetPresignedUrlDto) {}
}
