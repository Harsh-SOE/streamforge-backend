import * as joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthzConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../../.env',
      isGlobal: true,
      validationSchema: joi.object({
        HTTP_PORT: joi.number().required(),
        SERVICE_PORT: joi.number().required(),
        FGA_API_URL: joi.string().required(),
        FGA_STORE_ID: joi.string().required(),
        FGA_MODEL_ID: joi.string().required(),
        GRAFANA_LOKI_URL: joi.string().required(),
      }),
    }),
  ],
  providers: [AuthzConfigService],
})
export class AuthzConfigModule {}
