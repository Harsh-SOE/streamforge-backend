export interface IQueryPersistanceACL<TQueryModel, TPersistance> {
  toQueryModel(schema: TPersistance): TQueryModel;

  toPersistance(model: TQueryModel): TPersistance;
}
