import { PartialType } from '@nestjs/mapped-types';

import { CreateChannelRequestDto } from './create-channel-request.dto';

export class UpdateChannelRequestDto extends PartialType(CreateChannelRequestDto) {}
