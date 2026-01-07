import * as joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ENVIRONMENT } from '@app/utils/enums';

import { QueryConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/query/.env',
      isGlobal: true,
      validationSchema: joi.object({
        NODE_ENVIRONMENT: joi
          .string()
          .valid(...Object.values(ENVIRONMENT))
          .required()
          .default(ENVIRONMENT.DEVELOPMENT),

        HTTP_PORT: joi.string().required(),
        GRPC_PORT: joi.string().required(),
        DATABASE_URL: joi.string().required(),
      }),
    }),
  ],
  providers: [QueryConfigService],
  exports: [QueryConfigService],
})
export class QueryConfigModule {}
