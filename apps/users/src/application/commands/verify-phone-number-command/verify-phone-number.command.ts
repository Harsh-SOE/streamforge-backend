import { UserVerifyPhoneNumberDto } from '@app/contracts/users';

export class VerifyPhoneNumberCommand {
  public constructor(public readonly userVerifyPhoneNumberDto: UserVerifyPhoneNumberDto) {}
}
