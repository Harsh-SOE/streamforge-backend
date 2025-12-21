import { ReactionAggregate } from '@reaction/domain/aggregates';

export interface ReactionBufferPort {
  bufferReaction(reaction: ReactionAggregate): Promise<void>;
}

export const REACTION_BUFFER_PORT = Symbol('REACTION_BUFFER_PORT');
