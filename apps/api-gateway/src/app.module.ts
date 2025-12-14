import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AppConfigModule } from './infrastructure/config';
import { VideoModule } from './services/videos/video.module';
import { UsersModule } from './services/users/users.module';
import { AuthModule } from './services/auth/auth.module';
import { WatchModule } from './services/views/views.module';
import { ResponseTimeMiddleware } from './persentation/middlewares';
import { CommentsModule } from './services/comments/comments.module';
import { ReactionModule } from './services/reactions/reaction.module';
import { ChannelModule } from './services/channel/channel.module';
import { AppHealthModule } from './infrastructure/health/health.module';
import { GlobalEnvironmentModule } from './persentation/global-environment.module';

@Module({
  imports: [
    AppConfigModule,
    AppHealthModule,
    VideoModule,
    UsersModule,
    AuthModule,
    ReactionModule,
    WatchModule,
    CommentsModule,
    ChannelModule,
    GlobalEnvironmentModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ResponseTimeMiddleware).forRoutes('*');
  }
}
