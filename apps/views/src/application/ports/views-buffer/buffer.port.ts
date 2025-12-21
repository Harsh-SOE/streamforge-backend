import { ViewAggregate } from '@views/domain/aggregates';

export interface ViewsBufferPort {
  bufferView(view: ViewAggregate): Promise<void>;
}

export const VIEWS_BUFFER_PORT = Symbol('VIEWS_BUFFER_PORT');
