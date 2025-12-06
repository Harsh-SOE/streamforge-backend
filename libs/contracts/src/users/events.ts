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
}

export interface UserProfileDeletedEventDto {
  id: string;
}
