export interface Auth0ProfileUser {
  provider: string;
  providerId: string;
  email?: string;
  userName?: string;
  fullName?: string;
  avatar?: string;
  dob?: string;
  accessToken: string;
  refreshToken: string;
}
