import { ChangeLanguageCommandHandler } from './change-language-command/change-language.handler';
import { ChangeNotificationCommandHandler } from './change-notification-status-command/change-notification-status.handler';
import { ChangeThemeCommandHandler } from './change-theme-command/change-theme.handler';
import { CompleteSignupCommandHandler } from './create-profile-command/create-profile.handler';
import { GeneratePreSignedUrlHandler } from './generate-presigned-url-command/generate-presigned-url.handler';
import { UpdateProfileCommandHandler } from './update-profile-command/update-profile.handler';
import { VerifyPhoneNumberCommandHandler } from './verify-phone-number-command/verify-phone-number.handler';

export const UserCommandHandlers = [
  GeneratePreSignedUrlHandler,
  ChangeLanguageCommandHandler,
  ChangeNotificationCommandHandler,
  ChangeThemeCommandHandler,
  CompleteSignupCommandHandler,
  UpdateProfileCommandHandler,
  VerifyPhoneNumberCommandHandler,
];

export * from './change-language-command/change-language.command';
export * from './change-notification-status-command/change-notification-status.command';
export * from './change-theme-command/change-theme.command';
export * from './create-profile-command/create-profile.command';
export * from './generate-presigned-url-command/generate-presigned-url.command';
export * from './update-profile-command/update-profile.command';
export * from './verify-phone-number-command/verify-phone-number.command';
