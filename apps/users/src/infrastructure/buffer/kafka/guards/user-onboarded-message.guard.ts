import { Entity } from '@app/common';
import { BufferMessage } from '@app/common/buffer';

import { UserOnBoardedBufferMessagePayload } from '../types';

export function isUserOnBoardedBufferMessage(
  message: BufferMessage<Entity, any>,
): message is BufferMessage<Entity.USER, UserOnBoardedBufferMessagePayload> {
  return message.entity === Entity.USER;
}
