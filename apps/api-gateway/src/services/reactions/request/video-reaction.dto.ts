import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReactionRequestStatus } from '../enums';

export class VideoReactionDto {
  @IsNotEmpty()
  @IsEnum(ReactionRequestStatus)
  reactionStatus: ReactionRequestStatus;
}
