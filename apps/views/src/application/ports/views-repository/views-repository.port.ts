import { ViewAggregate } from '@views/domain/aggregates';

export interface ViewRepositoryPort {
  save(model: ViewAggregate): Promise<ViewAggregate>;

  saveMany(models: ViewAggregate[]): Promise<number>;
}

export const VIEWS_REPOSITORY_PORT = Symbol('VIEWS_REPOSITORY_PORT');
