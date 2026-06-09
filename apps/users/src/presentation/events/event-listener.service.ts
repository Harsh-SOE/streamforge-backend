import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { IntegrationEvent } from '@app/contracts/events/base';
import { UserOnboardedIntegrationEvent, USER_EVENT_CAUSES } from '@app/contracts/events/users';
import { EVENT_CONSUMER_PORT, EventsConsumerPort } from '@app/common/ports/events';

import { EventsService } from './events-listener.service';

@Injectable()
export class EventsListenerService implements OnModuleInit {
  public constructor(
    @Inject(EVENT_CONSUMER_PORT)
    private readonly eventConsumer: EventsConsumerPort,
    private readonly eventsService: EventsService,
  ) {}

  public async onModuleInit() {
    await this.eventConsumer.consumeMessage(async (event: IntegrationEvent<any>) => {
      // react to all relevant messages here...
      switch (event.cause) {
        case USER_EVENT_CAUSES.USER_ONBOARDED_INTEGRATION_EVENT.toString(): {
          await this.eventsService.OnUserOnboardedEvent(event as UserOnboardedIntegrationEvent);
          break;
        }
      }
    });
  }
}
