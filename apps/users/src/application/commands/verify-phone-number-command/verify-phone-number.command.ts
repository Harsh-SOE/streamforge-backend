import { UserVerifyPhoneNumberDto } from '@app/contracts/protocols/users';

export class VerifyPhoneNumberCommand {
  public constructor(public readonly userVerifyPhoneNumberDto: UserVerifyPhoneNumberDto) {}
}
