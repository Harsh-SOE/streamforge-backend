export interface UserQueryModel {
  userId: string;
  email: string;
  userAuthId: string;
  userName: string;
  avatar: string;
  handle: string;
  hasChannel: boolean;
  phoneNumber?: string;
  isPhoneNumberVerified?: boolean;
  dob?: string;
}
