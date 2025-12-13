import { Controller, UseFilters } from '@nestjs/common';
import { Observable } from 'rxjs';

import {
  AuthZServiceController,
  CheckRelationDto,
  CreateRelationDto,
  IsRelatedResponse,
  RelationCreatedResponse,
} from '@app/contracts/authz';

import { GrpcService } from './gprc.service';
import { GrpcFilter } from '../filter';

@Controller('authz')
@UseFilters(GrpcFilter)
export class GrpcController implements AuthZServiceController {
  constructor(private readonly grpcService: GrpcService) {}
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
