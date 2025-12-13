import { Inject, Injectable } from '@nestjs/common';

import {
  CheckRelationDto,
  CreateRelationDto,
  IsRelatedResponse,
  RelationCreatedResponse,
} from '@app/contracts/authz';

import { AUTHORIZE_PORT, AuthorizePort } from '@authz/application/ports/auth';

@Injectable()
export class GrpcService {
  constructor(@Inject(AUTHORIZE_PORT) private readonly openFGAService: AuthorizePort) {}

  async checkRelation(checkRelationDto: CheckRelationDto): Promise<IsRelatedResponse> {
    const response = await this.openFGAService.checkRelation({
      user: checkRelationDto.user,
      relation: checkRelationDto.relation,
      object: checkRelationDto.resource,
    });
    return {
      allowed: response.isRelated,
    };
  }

  async createRelation(createRelationDto: CreateRelationDto): Promise<RelationCreatedResponse> {
    const response = await this.openFGAService.createRelation({
      user: createRelationDto.user,
      relation: createRelationDto.relation,
      object: createRelationDto.resource,
    });
    return {
      created: response.created,
    };
  }
}
