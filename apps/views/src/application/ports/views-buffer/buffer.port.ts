import { ViewAggregate } from '@views/domain/aggregates';

export interface ViewsBufferPort {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  bufferView(view: ViewAggregate): Promise<void>;
}

export const VIEWS_BUFFER_PORT = Symbol('VIEWS_BUFFER_PORT');
