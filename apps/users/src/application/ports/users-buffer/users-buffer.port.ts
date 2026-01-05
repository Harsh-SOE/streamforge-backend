import { UserAggregate } from '@users/domain/aggregates';

export interface UsersBufferPort {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  bufferUser(user: UserAggregate): Promise<void>;
}

export const USERS_BUFFER_PORT = Symbol('USERS_BUFFER_PORT');
