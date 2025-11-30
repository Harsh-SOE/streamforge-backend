import { IsNotEmpty, IsString } from 'class-validator';

export class CommentOnVideo {
  @IsNotEmpty()
  @IsString()
  comment: string;
}
