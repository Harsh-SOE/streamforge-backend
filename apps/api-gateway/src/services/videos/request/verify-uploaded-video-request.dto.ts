import { IsNotEmpty, IsString } from 'class-validator';

export class VerfiyUploadedVideoRequestDto {
  @IsString()
  @IsNotEmpty()
  videoId: string;
}
