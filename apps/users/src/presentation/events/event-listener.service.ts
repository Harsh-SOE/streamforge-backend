import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { IntegrationEvent } from '@app/common/events';
import { UserOnboardedIntegrationEvent, USER_INTEGRATION_EVENTS } from '@app/common/events/users';
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
      switch (event.eventType) {
        case USER_INTEGRATION_EVENTS.USER_ONBOARDED_INTEGRATION_EVENT.toString(): {
          await this.eventsService.OnUserOnboardedEvent(event as UserOnboardedIntegrationEvent);
          break;
        }
      }
    });
  }
}
