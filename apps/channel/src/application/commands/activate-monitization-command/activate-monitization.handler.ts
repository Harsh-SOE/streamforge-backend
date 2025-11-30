import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { ChannelMonitizationActivatedResponse } from '@app/contracts/channel';

import {
  CHANNEL_COMMAND_REPOSITORY,
  ChannelCommandRepositoryPort,
} from '@channel/application/ports';

import { ActivateMonitizationCommand } from './activate-monitization.command';

@CommandHandler(ActivateMonitizationCommand)
export class ActivateMonitizationCommandHandler implements ICommandHandler<ActivateMonitizationCommand> {
  public constructor(
    @Inject(CHANNEL_COMMAND_REPOSITORY)
    private readonly channelRespository: ChannelCommandRepositoryPort,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({
    channelActivateMonitizationDto,
  }: ActivateMonitizationCommand): Promise<ChannelMonitizationActivatedResponse> {
    const { id } = channelActivateMonitizationDto;

    const channelAggregate = await this.channelRespository.findOneById(id);

    if (!channelAggregate) {
      throw new Error();
    }

    const channelAggregateWithEvents =
      this.eventPublisher.mergeObjectContext(channelAggregate);

    channelAggregateWithEvents.updateChannelMonitizedStatus(true);

    await this.channelRespository.updateOneById(id, channelAggregateWithEvents);

    channelAggregateWithEvents.commit();

    return { response: `Channel monitized successfully`, isMonitized: true };
  }
}
