import { UserAggregate } from '@users/domain/aggregates';

export interface UsersBufferPort {
  bufferUser(user: UserAggregate): Promise<void>;
}

export const USERS_BUFFER_PORT = Symbol('USERS_BUFFER_PORT');
