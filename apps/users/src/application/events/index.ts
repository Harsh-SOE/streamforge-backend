import { UserOnboardedIntegrationEventHandler } from './user-onboarded.handler';
import { ThemeChangedIntegrationEventHandler } from './theme-changed.handler';
import { LanguageChangedIntegrationEventHandler } from './language-changed.handler';
import { UserProfileUpdatedIntegrationEventHandler } from './user-profile-updated.handler';
import { PhoneNumberVerfiedIntegrationEventHandler } from './phone-number-verified.handler';
import { NotificationStatusChangedIntegrationEventHandler } from './notification-status-changed.handler';

export const UserIntegrationEventHandlers = [
  UserOnboardedIntegrationEventHandler,
  LanguageChangedIntegrationEventHandler,
  NotificationStatusChangedIntegrationEventHandler,
  ThemeChangedIntegrationEventHandler,
  UserProfileUpdatedIntegrationEventHandler,
  PhoneNumberVerfiedIntegrationEventHandler,
];
