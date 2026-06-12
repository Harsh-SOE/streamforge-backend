import { CheckUploadedVideoDto } from '@app/contracts/protocols/videos';

export class VerifyUploadedMediaCommand {
  public constructor(public checkUploadedVideoDto: CheckUploadedVideoDto) {}
}
