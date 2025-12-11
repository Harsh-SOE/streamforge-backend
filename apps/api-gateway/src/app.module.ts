import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { LOGGER_PORT } from '@app/ports/logger';

import { AppConfigModule } from './infrastructure/config';
import { VideoModule } from './services/videos/video.module';
import { UsersModule } from './services/users/users.module';
import { MeasureModule } from './infrastructure/measure';
import { AuthModule } from './services/auth/auth.module';
import { WatchModule } from './services/views/views.module';
import { ResponseTimeMiddleware } from './persentation/middlewares';
import { CommentsModule } from './services/comments/comments.module';
import { AppHealthModule } from './infrastructure/health/health.module';
import { WinstonLoggerAdapter } from './infrastructure/logger';
import { AppJwtModule } from './infrastructure/jwt/jwt.module';
import { ReactionModule } from './services/reactions/reaction.module';
import { ChannelModule } from './services/channel/channel.module';

@Module({
  imports: [
    AppConfigModule,
    AppJwtModule,
    VideoModule,
    UsersModule,
    MeasureModule,
    AuthModule,
    ReactionModule,
    WatchModule,
    CommentsModule,
    AppHealthModule,
    ChannelModule,
  ],
  providers: [{ provide: LOGGER_PORT, useClass: WinstonLoggerAdapter }],
  exports: [LOGGER_PORT],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ResponseTimeMiddleware).forRoutes('*');
  }
}
