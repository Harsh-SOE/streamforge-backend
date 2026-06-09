import { Observable } from 'rxjs';
import { Controller, UseFilters } from '@nestjs/common';

import {
  AuthZServiceController,
  CheckRelationDto,
  CreateRelationDto,
  IsRelatedResponse,
  RelationCreatedResponse,
} from '@app/contracts/protocols/authz';

import { GrpcFilter } from '../filter';
import { RpcService } from './rpc.service';

@Controller('authz')
@UseFilters(GrpcFilter)
export class RpcController implements AuthZServiceController {
  constructor(private readonly grpcService: RpcService) {}
  checkRelation(
    checkRelationDto: CheckRelationDto,
  ): Promise<IsRelatedResponse> | Observable<IsRelatedResponse> | IsRelatedResponse {
    return this.grpcService.checkRelation(checkRelationDto);
  }

  createRelation(
    createRelationDto: CreateRelationDto,
  ):
    | Promise<RelationCreatedResponse>
    | Observable<RelationCreatedResponse>
    | RelationCreatedResponse {
    return this.grpcService.createRelation(createRelationDto);
  }
}
