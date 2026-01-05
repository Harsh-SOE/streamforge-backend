import { OpenFgaClient } from '@openfga/sdk';
import { Inject, Injectable } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import {
  AuthorizePort,
  CheckRelationOptions,
  CheckRelationResponse,
  CreateRelationOptions,
  CreateRelationResponse,
} from '@authz/application/ports/auth';
import { AuthzConfigService } from '@authz/infrastructure/config';

@Injectable()
export class OpenFGAAuthAdapter implements AuthorizePort {
  private readonly client: OpenFgaClient;

  constructor(
    private readonly configService: AuthzConfigService,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {
    this.client = new OpenFgaClient({
      apiUrl: this.configService.FGA_API_URL,
      storeId: this.configService.FGA_STORE_ID,
      authorizationModelId: this.configService.FGA_MODEL_ID,
    });
  }

  async createRelation(
    createRelationOptions: CreateRelationOptions,
  ): Promise<CreateRelationResponse> {
    const response = await this.client.write({
      writes: [
        {
          user: createRelationOptions.user,
          relation: createRelationOptions.relation,
          object: createRelationOptions.object,
        },
      ],
    });
    return {
      created: response.writes.length > 0,
    };
  }

  async checkRelation(checkRelationOptions: CheckRelationOptions): Promise<CheckRelationResponse> {
    const response = await this.client.check({
      user: checkRelationOptions.user,
      relation: checkRelationOptions.relation,
      object: checkRelationOptions.object,
    });
    return {
      isRelated: response.allowed ?? false,
    };
  }
}
