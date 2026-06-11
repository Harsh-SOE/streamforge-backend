import { Entity } from '@app/common';
import { BufferMessage } from '@app/common/buffer';

import { VideoBufferMessagePayload } from './video.buffer-message.payload';

export class VideoBufferMessage implements BufferMessage<Entity, VideoBufferMessagePayload> {
  public readonly entity = Entity.VIDEO;
  public constructor(public readonly payload: VideoBufferMessagePayload) {}
}
