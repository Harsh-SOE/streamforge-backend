import { AggregateRoot } from '@nestjs/cqrs';

export interface IAggregatePersistanceACL<TAggregate extends AggregateRoot, TPersistance> {
  toAggregate(schema: TPersistance): TAggregate;

  toPersistance(model: TAggregate): TPersistance;
}
