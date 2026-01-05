import { UserChangeNotificationStatusDto } from '@app/contracts/users';

export class ChangeNotificationCommand {
  public constructor(
    public readonly userChangeNotificationStatusDto: UserChangeNotificationStatusDto,
  ) {}
}
