import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  VideoRequestPublishStatus,
  VideoRequestVisibilityStatus,
} from '../enums';

export class CreateVideoRequestDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  videoFileIdentifier: string;

  @IsNotEmpty()
  @IsString()
  videoThumbnailIdentifier: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  categories: string[];

  @IsEnum(VideoRequestPublishStatus)
  status: VideoRequestPublishStatus = VideoRequestPublishStatus.PENDING;

  @IsEnum(VideoRequestVisibilityStatus)
  visibility: VideoRequestVisibilityStatus =
    VideoRequestVisibilityStatus.PRIVATE;
}
