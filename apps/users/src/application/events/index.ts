import { ChangeLanguageEventHandler } from './change-language-event/change-language.handler';
import { ChangeNotificationStatusEventHandler } from './change-notification-status-event/change-notification-status.handler';
import { ChangeThemeEventHandler } from './change-theme-event/change-theme.handler';
import { UpdateProfileEventHandler } from './update-profile-event/update-profile.handler';
import { PhoneNumberVerfiedEventHandler } from './phone-number-verified-event/phone-number-verified.handler';
import { CompleteProfileEventHandler } from './create-profile-event/create-profile.handler';

export const UserEventHandlers = [
  CompleteProfileEventHandler,
  ChangeLanguageEventHandler,
  ChangeNotificationStatusEventHandler,
  ChangeThemeEventHandler,
  UpdateProfileEventHandler,
  PhoneNumberVerfiedEventHandler,
];

export * from './create-profile-event/create-profile.event';
export * from './create-profile-event/create-profile.handler';
export * from './change-language-event/change-language.event';
export * from './change-language-event/change-language.handler';
export * from './change-notification-status-event/change-notification-status.event';
export * from './change-notification-status-event/change-notification-status.handler';
export * from './change-theme-event/change-theme.event';
export * from './change-theme-event/change-theme.handler';
export * from './phone-number-verified-event/phone-number-verified.event';
export * from './phone-number-verified-event/phone-number-verified.handler';
export * from './update-profile-event/update-profile.event';
export * from './update-profile-event/update-profile.handler';
