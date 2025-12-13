import {
  CheckRelationOptions,
  CheckRelationResponse,
  CreateRelationOptions,
  CreateRelationResponse,
} from './options';

export interface AuthorizePort {
  createRelation(createRelationOptions: CreateRelationOptions): Promise<CreateRelationResponse>;

  checkRelation(checkRelationOptions: CheckRelationOptions): Promise<CheckRelationResponse>;
}

export const AUTHORIZE_PORT = Symbol('AUTHORIZE_PORT');
