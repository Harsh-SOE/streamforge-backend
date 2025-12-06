import { UserProfileCreatedEventDto } from '@app/contracts/users';

export interface UserProjectionBufferPort {
  bufferUserCards(event: UserProfileCreatedEventDto): Promise<void>;

  processUserCards(): Promise<number | void>;
}

export const USER_PROJECTION_BUFFER_PORT = Symbol(
  'USER_PROJECTION_BUFFER_PORT',
);
