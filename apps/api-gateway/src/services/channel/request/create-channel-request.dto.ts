import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChannelRequestDto {
  @IsNotEmpty()
  @IsString()
  Bio: string;

  @IsNotEmpty()
  @IsString()
  coverImage: string;
}
