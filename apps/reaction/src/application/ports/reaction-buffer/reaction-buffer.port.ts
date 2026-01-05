import { ReactionAggregate } from '@reaction/domain/aggregates';

export interface ReactionBufferPort {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  bufferReaction(reaction: ReactionAggregate): Promise<void>;
}

export const REACTION_BUFFER_PORT = Symbol('REACTION_BUFFER_PORT');
