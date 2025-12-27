import { Inject, Injectable } from '@nestjs/common';

import { Components } from '@app/common/components';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { PrismaHandler } from '@app/handlers/database-handler';

import { ChannelAggregate } from '@channel/domain/aggregates';
import { ChannelCommandRepositoryPort } from '@channel/application/ports';
import { ChannelAggregatePersistanceACL } from '@channel/infrastructure/anti-corruption';
import { PrismaDBClient } from '@app/clients/prisma';
import { PrismaClient as ChannelPrismaClient } from '@persistance/channel';

@Injectable()
export class ChannelRepositoryAdapter implements ChannelCommandRepositoryPort {
  public constructor(
    private readonly channelPersistanceACL: ChannelAggregatePersistanceACL,
    private readonly prismaDatabaseHandler: PrismaHandler,
    private readonly prisma: PrismaDBClient<ChannelPrismaClient>,
    @Inject(LOGGER_PORT) private logger: LoggerPort,
  ) {}

  public async saveChannel(model: ChannelAggregate): Promise<ChannelAggregate> {
    const saveChannelOperation = async () =>
      await this.prisma.client.channel.create({
        data: this.channelPersistanceACL.toPersistance(model),
      });
    const createdChannel = await this.prismaDatabaseHandler.execute(saveChannelOperation, {
      operationType: 'CREATE',
      entity: this.channelPersistanceACL.toPersistance(model),
    });
    return this.channelPersistanceACL.toAggregate(createdChannel);
  }

  public async saveManyChannels(models: ChannelAggregate[]): Promise<number> {
    if (!models || models.length === 0) {
      return 0;
    }

    const channelsToCreate = models.map((model) => this.channelPersistanceACL.toPersistance(model));
    this.logger.info(`Saving: ${channelsToCreate.length} documents into the database as a batch`, {
      component: Components.DATABASE,
      service: 'CHANNELS',
    });
    const saveManyChannelsOperations = async () =>
      await this.prisma.client.channel.createMany({
        data: models.map((model) => this.channelPersistanceACL.toPersistance(model)),
      });

    const createdEntities = await this.prismaDatabaseHandler.execute(saveManyChannelsOperations, {
      operationType: 'CREATE',
      entity: channelsToCreate,
    });
    return createdEntities.count;
  }

  public async updateOneChannelById(
    channelId: string,
    updatedChannelModel: ChannelAggregate,
  ): Promise<ChannelAggregate> {
    const updateChannelByIdOperation = async () =>
      await this.prisma.client.channel.update({
        where: { id: channelId },
        data: this.channelPersistanceACL.toPersistance(updatedChannelModel),
      });

    const updatedChannel = await this.prismaDatabaseHandler.execute(updateChannelByIdOperation, {
      operationType: 'UPDATE',
      entity: this.channelPersistanceACL.toPersistance(updatedChannelModel),
      filter: { id: channelId },
    });

    return this.channelPersistanceACL.toAggregate(updatedChannel);
  }

  public async updateOneChannelByUserId(
    userId: string,
    updatedChannelModel: ChannelAggregate,
  ): Promise<ChannelAggregate> {
    const updateChannelByIdOperation = async () =>
      await this.prisma.client.channel.update({
        where: { userId },
        data: this.channelPersistanceACL.toPersistance(updatedChannelModel),
      });

    const updatedChannel = await this.prismaDatabaseHandler.execute(updateChannelByIdOperation, {
      operationType: 'UPDATE',
      entity: this.channelPersistanceACL.toPersistance(updatedChannelModel),
      filter: { userId },
    });

    return this.channelPersistanceACL.toAggregate(updatedChannel);
  }

  public async findOneChannelById(channelId: string): Promise<ChannelAggregate | null> {
    const findChannelByIdOperation = async () => {
      return await this.prisma.client.channel.findUnique({
        where: { id: channelId },
      });
    };

    const foundChannel = await this.prismaDatabaseHandler.execute(findChannelByIdOperation, {
      operationType: 'READ',
      filter: { id: channelId },
    });

    return foundChannel ? this.channelPersistanceACL.toAggregate(foundChannel) : null;
  }

  public async findOneChannelByUserId(userId: string): Promise<ChannelAggregate | null> {
    const findChannelByIdOperation = async () => {
      return await this.prisma.client.channel.findUnique({
        where: { userId },
      });
    };

    const foundChannel = await this.prismaDatabaseHandler.execute(findChannelByIdOperation, {
      operationType: 'READ',
      filter: { userId },
    });

    return foundChannel ? this.channelPersistanceACL.toAggregate(foundChannel) : null;
  }

  public async deleteOneChannelById(channelId: string): Promise<boolean> {
    const deleteChannelByIdOperation = async () => {
      return await this.prisma.client.channel.delete({
        where: { id: channelId },
      });
    };

    const deletedChannel = await this.prismaDatabaseHandler.execute(deleteChannelByIdOperation, {
      operationType: 'DELETE',
      filter: { id: channelId },
    });

    return deletedChannel ? true : false;
  }

  public async deleteOneChannelByUserId(userId: string): Promise<boolean> {
    const deleteChannelByIdOperation = async () => {
      return await this.prisma.client.channel.delete({
        where: { userId },
      });
    };

    const deletedChannel = await this.prismaDatabaseHandler.execute(deleteChannelByIdOperation, {
      operationType: 'DELETE',
      filter: { userId },
    });

    return deletedChannel ? true : false;
  }
}
