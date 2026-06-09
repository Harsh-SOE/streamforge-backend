import { ReactionType } from '@app/contracts/protocols/reaction';

export interface ReactionBufferMessagePayload {
  userId: string;
  videoId: string;
  reactionStatus: ReactionType;
}
