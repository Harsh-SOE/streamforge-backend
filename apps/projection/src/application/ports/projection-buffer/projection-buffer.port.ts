import { IntegrationEvent } from '@app/common/events';

export interface ProjectionBufferPort {
  // todo: fix this integration event payload...
  bufferUser(event: IntegrationEvent<any>): Promise<void>;

  // todo: fix this integration event payload...
  bufferVideo(event: IntegrationEvent<any>): Promise<void>;
}

export const PROJECTION_BUFFER_PORT = Symbol('PROJECTION_BUFFER_PORT');
