import { UserProfileHandler } from './onboarded.handler';
import { ThemeChangedHandler } from './theme-changed.handler';
import { LanguageChangedHandler } from './language-changed.handler';
import { UserProfileUpdatedHandler } from './user-profile-updated.handler';
import { PhoneNumberVerfiedHandler } from './phone-number-verified.handler';
import { NotificationStatusChangedHandler } from './user-notification-status-changed.handler';

export const UserEventHandlers = [
  UserProfileHandler,
  LanguageChangedHandler,
  NotificationStatusChangedHandler,
  ThemeChangedHandler,
  UserProfileUpdatedHandler,
  PhoneNumberVerfiedHandler,
];
