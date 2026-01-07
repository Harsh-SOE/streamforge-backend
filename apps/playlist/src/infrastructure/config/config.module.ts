import * as joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ENVIRONMENT } from '@app/utils/enums';

import { PlaylistConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/playlist/.env',
      validationSchema: joi.object({
        NODE_ENVIRONMENT: joi
          .string()
          .valid(...Object.values(ENVIRONMENT))
          .required()
          .default(ENVIRONMENT.DEVELOPMENT),

        HTTP_PORT: joi.string().required(),
        GRPC_PORT: joi.string().required(),
      }),
    }),
  ],
  providers: [PlaylistConfigService],
})
export class PlaylistConfigModule {}
