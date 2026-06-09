import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { IntegrationEvent } from '@app/contracts/events/base';
import { UserOnboardedIntegrationEvent, USER_EVENT_CAUSES } from '@app/contracts/events/users';
import { EVENT_CONSUMER_PORT, EventsConsumerPort } from '@app/common/ports/events';

import { EventsService } from './events.service';

@Injectable()
export class EventsListener implements OnModuleInit {
  public constructor(
    @Inject(EVENT_CONSUMER_PORT)
    private readonly eventConsumer: EventsConsumerPort,
    private readonly eventsService: EventsService,
  ) {}

  public async onModuleInit() {
    await this.eventConsumer.consumeMessage(async (event: IntegrationEvent<unknown>) => {
      // react to all relevant messages here...
      console.log(`Recieved event`, event);

      switch (event.cause) {
        case USER_EVENT_CAUSES.USER_ONBOARDED_INTEGRATION_EVENT.toString(): {
          await this.eventsService.sendEMail(
            (event as UserOnboardedIntegrationEvent).payload.email,
          );
          break;
        }
      }
    });
  }
}
