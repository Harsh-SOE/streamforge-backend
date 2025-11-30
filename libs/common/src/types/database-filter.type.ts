/**
 * Represents the set of supported comparison operators for filtering queries.
 *
 * - `'eq'`: Equal to
 * - `'ne'`: Not equal to
 * - `'gte'`: Greater than or equal to
 * - `'gt'`: Greater than
 * - `'lte'`: Less than or equal to
 * - `'lt'`: Less than
 * - `'startsWith'`: starts with
 * - `'endsWith'`: ends with
 */
export type Operators = 'eq' | 'ne' | 'gte' | 'gt' | 'lte' | 'lt';

/**
 * Represents a condition to be applied on a specific field of a persistance schema.
 *
 * @template PersistanceSchema - The type representing the persistance schema.
 * @property field - The key of the field in the persistance schema to which the condition applies.
 * @property operator - The comparison operator to use for the condition.
 * @property value - The value to compare the field against.
 * @example
 * type Book = { title: string; author: string; year: number };
 * const fieldCondition: FieldCondition<Book> = {
 *   field: year,
 *   operator: 'gte',
 *   value: 1971
 * };
 */
export type FieldCondition<PersistanceSchema> = {
  field: keyof PersistanceSchema;
  operator: Operators;
  value: any;
};

/**
 * Represents a flexible filter type for querying a persistence schema in the database.
 *
 * @template PersistanceSchema - The schema type representing the database entity.
 *
 * This type allows specifying partial field-value pairs for filtering,
 * as well as logical operators (`and`, `or`, `not`) to combine multiple field conditions.
 *
 * - Each key of the schema can be optionally provided with a value to filter by.
 * - The `and`, `or`, and `not` properties accept arrays of field conditions to build complex queries.
 *
 * @example
 * ```typescript
 * type Book = { title: string; author: string; year: number };
 * const filter: DatabaseFilter<Book> = {
 *   title: "1984",
 *   or: [
 *     { author: "Orwell" },
 *     { year: 1949 }
 *   ]
 * };
 * ```
 * @description In above example, all the books having title '1984' which were either published in year '1949' or written by
 * 'Orwell' will be returned.
 */
export type DatabaseFilter<PersistanceSchema> = Partial<{
  [KeyOfSchema in keyof PersistanceSchema]: PersistanceSchema[KeyOfSchema];
}> & {
  and?: Array<FieldCondition<PersistanceSchema>>;
  or?: Array<FieldCondition<PersistanceSchema>>;
  not?: Array<FieldCondition<PersistanceSchema>>;
};
