import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { LOGGER_PORT } from '@app/ports/logger';
import { RedisCacheHandler } from '@app/handlers/cache-handler';
import { RedisBufferHandler } from '@app/handlers/buffer-handler';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';

import {
  VIEWS_BUFFER_PORT,
  VIEWS_CACHE_PORT,
  VIEWS_REPOSITORY_PORT,
} from '@views/application/ports';
import { AppConfigModule } from '@views/infrastructure/config';
import { ViewCacheAdapter } from '@views/infrastructure/cache/adapters';
import { ViewRepositoryAdapter } from '@views/infrastructure/repository/adapters';
import { RedisStreamBufferAdapter } from '@views/infrastructure/buffer/adapters';
import { WinstonLoggerAdapter } from '@views/infrastructure/logger';
import { ViewPeristanceAggregateACL } from '@views/infrastructure/anti-corruption';
import { PersistanceService } from '@views/infrastructure/persistance/adapter';

import { GrpcController } from './grpc.controller';
import { GrpcService } from './grpc.service';

@Module({
  imports: [AppConfigModule, CqrsModule],
  controllers: [GrpcController],
  providers: [
    GrpcService,
    RedisBufferHandler,
    RedisCacheHandler,
    ViewPeristanceAggregateACL,
    PrismaDatabaseHandler,
    PersistanceService,
    { provide: VIEWS_CACHE_PORT, useClass: ViewCacheAdapter },
    { provide: VIEWS_REPOSITORY_PORT, useClass: ViewRepositoryAdapter },
    { provide: VIEWS_BUFFER_PORT, useClass: RedisStreamBufferAdapter },
    { provide: LOGGER_PORT, useClass: WinstonLoggerAdapter },
  ],
})
export class GrpcModule {}
