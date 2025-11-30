import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { AppConfigModule } from '@videos/infrastructure/config';
import { VideoEventHandler } from '@videos/application/events';

import { MessageController } from './message.controller';
import { MessageHandlerService } from './message.service';

import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
  imports: [AppConfigModule, InfrastructureModule, CqrsModule],
  controllers: [MessageController],
  providers: [...VideoEventHandler, MessageHandlerService],
})
export class MessageModule {}
