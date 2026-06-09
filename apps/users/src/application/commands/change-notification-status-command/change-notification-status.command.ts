import { UserChangeNotificationStatusDto } from '@app/contracts/protocols/users';

export class ChangeNotificationCommand {
  public constructor(
    public readonly userChangeNotificationStatusDto: UserChangeNotificationStatusDto,
  ) {}
}
