export interface UserOnboardedEvent {
  readonly eventName: string;
  readonly eventVersion: number;
  readonly eventId: string;
  readonly occurredAt: string;
  readonly payload: { userId: string; authId: string; email: string; handle: string };
}

export interface UserProfileCreatedEventDto {
  id: string;
  userAuthId: string;
  handle: string;
  email: string;
  avatar: string;
  dob?: string;
  phoneNumber?: string;
  isPhoneNumberVerified?: boolean;
}

export interface UserProfileUpdatedEventDto {
  id: string;
  avatar?: string;
  dob?: string;
  phoneNumber?: string;
}

export interface UserPhoneNumberEventDto {
  id: string;
  phoneNumber: string;
}

export interface UserThemeChangedEventDto {
  id: string;
  theme: string;
}

export interface UserNotificationChangedEventDto {
  id: string;
  status: boolean;
}

export interface UserLanguageChangedEventDto {
  id: string;
  language: string;
}

export interface UserProfileDeletedEventDto {
  id: string;
}
