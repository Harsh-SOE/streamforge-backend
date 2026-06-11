import { Entity } from '@app/common';
import { BufferMessage } from '@app/common/buffer';

import { VideoBufferMessagePayload } from '../../redis/types';

export function isVideoBufferMessage(
  message: BufferMessage<Entity, any>,
): message is BufferMessage<Entity.VIDEO, VideoBufferMessagePayload> {
  return message.entity === Entity.VIDEO;
}
