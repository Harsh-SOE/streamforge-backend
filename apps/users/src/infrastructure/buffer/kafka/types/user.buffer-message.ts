import { Entity } from '@app/common';
import { BufferMessage } from '@app/common/buffer';

import { DomainThemePreference } from '@users/domain/enums';

export interface UserOnBoardedBufferMessagePayload {
  id: string;
  userAuthId: string;
  handle: string;
  email: string;
  avatarUrl: string;
  dob?: string;
  phoneNumber?: string;
  isPhoneNumbetVerified: boolean;
  notification: boolean;
  themePreference: DomainThemePreference;
  languagePreference: string;
  region: string;
}

export class UserOnBoardedBufferMessage implements BufferMessage<
  Entity,
  UserOnBoardedBufferMessagePayload
> {
  public readonly entity = Entity.USER;
  public constructor(public readonly payload: UserOnBoardedBufferMessagePayload) {}
}
