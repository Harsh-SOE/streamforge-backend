import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateVideoRequestDto } from './create-video-request.dto';

export class UpdateVideoRequestDto extends PartialType(
  OmitType(CreateVideoRequestDto, ['videoFileIdentifier']),
) {}
