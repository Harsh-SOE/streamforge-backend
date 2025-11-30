export interface DatabaseQueryFilter<PersistanceSchema> {
  limit?: number;
  skip?: number;
  orderBy?: { [KeyOfSchema in keyof PersistanceSchema]: 'asc' | 'desc' };
}
