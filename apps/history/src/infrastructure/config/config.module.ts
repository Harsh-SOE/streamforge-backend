import * as joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HistoryConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/history/.env',
      validationSchema: joi.object({
        HTTP_PORT: joi.number().required(),
        GRPC_PORT: joi.number().required(),
      }),
    }),
  ],
  providers: [HistoryConfigService],
})
export class HistoryConfigModule {}
