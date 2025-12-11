import { UserJwtAuthPayload } from '@gateway/infrastructure/jwt/types';

export interface UserConsistentQuery {
  hasUserRegistered(id: string): Promise<UserJwtAuthPayload>;
}
