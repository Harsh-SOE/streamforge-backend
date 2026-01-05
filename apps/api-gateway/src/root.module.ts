import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AuthModule } from './services/auth/auth.module';
import { UsersModule } from './services/users/users.module';
import { WatchModule } from './services/views/views.module';
import { GatwayConfigModule } from './infrastructure/config';
import { VideoModule } from './services/videos/video.module';
import { ChannelModule } from './services/channel/channel.module';
import { ResponseTimeMiddleware } from './persentation/middlewares';
import { CommentsModule } from './services/comments/comments.module';
import { ReactionModule } from './services/reactions/reaction.module';
import { AppHealthModule } from './infrastructure/health/health.module';
import { PlatformModule } from './infrastructure/platform/platform.module';

@Module({
  imports: [
    GatwayConfigModule,
    AppHealthModule,
    VideoModule,
    UsersModule,
    AuthModule,
    ReactionModule,
    WatchModule,
    CommentsModule,
    ChannelModule,
    PlatformModule,
  ],
})
export class RootModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ResponseTimeMiddleware).forRoutes('*');
  }
}
