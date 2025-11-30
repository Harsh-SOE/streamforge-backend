import { Inject, Injectable } from '@nestjs/common';

import { DatabaseFilter } from '@app/common/types';
import { Components } from '@app/common/components';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';

import { ChannelAggregate } from '@channel/domain/aggregates';
import { PersistanceService } from '@channel/infrastructure/persistance/adapter';
import { ChannelAggregatePersistanceACL } from '@channel/infrastructure/anti-corruption';
import { ChannelCommandRepositoryPort } from '@channel/application/ports';

import { Prisma, Channel } from '@peristance/channel';

@Injectable()
export class ChannelCommandRepositoryAdapter implements ChannelCommandRepositoryPort {
  public constructor(
    private channelPersistanceACL: ChannelAggregatePersistanceACL,
    private readonly prismaDatabaseHandler: PrismaDatabaseHandler,
    private persistanceService: PersistanceService,
    @Inject(LOGGER_PORT) private logger: LoggerPort,
  ) {}

  public toPrismaFilter(
    filter: DatabaseFilter<Channel>,
    mode: 'many' | 'unique',
  ): Prisma.ChannelWhereInput | Prisma.ChannelWhereUniqueInput {
    const prismaFilter:
      | Prisma.ChannelWhereInput
      | Prisma.ChannelWhereUniqueInput = {};

    (Object.keys(filter) as Array<keyof Channel>).forEach((key) => {
      const value = filter[key];
      if (value !== undefined) {
        prismaFilter[key as string] = value;
      }
    });

    if (mode === 'unique') return prismaFilter;

    if (filter.and) {
      prismaFilter.AND = filter.and.map((filterCondition) => ({
        [filterCondition.field]: {
          [filterCondition.operator]: [filterCondition.value],
        },
      }));
    }

    if (filter.or) {
      prismaFilter.OR = filter.or.map((filterCondition) => ({
        [filterCondition.field]: {
          [filterCondition.operator]: [filterCondition.value],
        },
      }));
    }

    if (filter.not) {
      prismaFilter.NOT = filter.not.map((filterCondition) => ({
        [filterCondition.field]: {
          [filterCondition.operator]: [filterCondition.value],
        },
      }));
    }

    return prismaFilter;
  }

  public async save(model: ChannelAggregate): Promise<ChannelAggregate> {
    const saveChannelOperation = async () =>
      await this.persistanceService.channel.create({
        data: this.channelPersistanceACL.toPersistance(model),
      });
    const createdChannel = await this.prismaDatabaseHandler.filter(
      saveChannelOperation,
      {
        operationType: 'CREATE',
        entry: this.channelPersistanceACL.toPersistance(model),
      },
    );
    return this.channelPersistanceACL.toAggregate(createdChannel);
  }

  public async saveMany(models: ChannelAggregate[]): Promise<number> {
    if (!models || models.length === 0) {
      return 0;
    }

    const channelsToCreate = models.map((model) =>
      this.channelPersistanceACL.toPersistance(model),
    );
    this.logger.info(
      `Saving: ${channelsToCreate.length} documents into the database as a batch`,
      {
        component: Components.DATABASE,
        service: 'CHANNELS',
      },
    );
    const saveManyChannelsOperations = async () =>
      await this.persistanceService.channel.createMany({
        data: models.map((model) =>
          this.channelPersistanceACL.toPersistance(model),
        ),
      });

    const createdEntities = await this.prismaDatabaseHandler.filter(
      saveManyChannelsOperations,
      { operationType: 'CREATE', entry: channelsToCreate },
    );
    return createdEntities.count;
  }

  async updateOneById(
    id: string,
    updatedChannelModel: ChannelAggregate,
  ): Promise<ChannelAggregate> {
    const updateChannelByIdOperation = async () =>
      await this.persistanceService.channel.update({
        where: { id },
        data: this.channelPersistanceACL.toPersistance(updatedChannelModel),
      });

    const updatedChannel = await this.prismaDatabaseHandler.filter(
      updateChannelByIdOperation,
      {
        operationType: 'UPDATE',
        entry: this.channelPersistanceACL.toPersistance(updatedChannelModel),
        filter: { id },
      },
    );

    return this.channelPersistanceACL.toAggregate(updatedChannel);
  }

  public async updateOne(
    filter: DatabaseFilter<Channel>,
    updatedChannelModel: ChannelAggregate,
  ): Promise<ChannelAggregate> {
    const updateChannelOperation = async () =>
      await this.persistanceService.channel.update({
        where: this.toPrismaFilter(
          filter,
          'unique',
        ) as Prisma.ChannelWhereUniqueInput,
        data: this.channelPersistanceACL.toPersistance(updatedChannelModel),
      });

    const updatedChannel = await this.prismaDatabaseHandler.filter(
      updateChannelOperation,
      {
        operationType: 'UPDATE',
        entry: this.channelPersistanceACL.toPersistance(updatedChannelModel),
        filter,
      },
    );

    return this.channelPersistanceACL.toAggregate(updatedChannel);
  }

  public async updateMany(
    filter: DatabaseFilter<Channel>,
    updatedChannelModel: ChannelAggregate,
  ): Promise<number> {
    const updateManyChannelsOperation = async () =>
      await this.persistanceService.channel.updateMany({
        where: this.toPrismaFilter(filter, 'many') as Prisma.ChannelWhereInput,
        data: this.channelPersistanceACL.toPersistance(updatedChannelModel),
      });

    const updatedChannels = await this.prismaDatabaseHandler.filter(
      updateManyChannelsOperation,
      {
        operationType: 'UPDATE',
        entry: this.channelPersistanceACL.toPersistance(updatedChannelModel),
        filter,
      },
    );

    return updatedChannels.count;
  }

  async findOneById(id: string): Promise<ChannelAggregate | null> {
    const findChannelByIdOperation = async () => {
      return await this.persistanceService.channel.findUnique({
        where: { id },
      });
    };

    const foundChannel = await this.prismaDatabaseHandler.filter(
      findChannelByIdOperation,
      {
        operationType: 'READ',
        filter: { id },
      },
    );

    return foundChannel
      ? this.channelPersistanceACL.toAggregate(foundChannel)
      : null;
  }

  async findOne(
    filter: DatabaseFilter<Channel>,
  ): Promise<ChannelAggregate | null> {
    const findChannelOperation = async () => {
      return await this.persistanceService.channel.findUnique({
        where: this.toPrismaFilter(
          filter,
          'unique',
        ) as Prisma.ChannelWhereUniqueInput,
      });
    };

    const foundChannel = await this.prismaDatabaseHandler.filter(
      findChannelOperation,
      {
        operationType: 'READ',
        filter,
      },
    );

    return foundChannel
      ? this.channelPersistanceACL.toAggregate(foundChannel)
      : null;
  }

  async findMany(filter: DatabaseFilter<Channel>): Promise<ChannelAggregate[]> {
    const findManyChannelsOperation = async () => {
      return await this.persistanceService.channel.findMany({
        where: this.toPrismaFilter(filter, 'many') as Prisma.ChannelWhereInput,
      });
    };

    const foundChannels = await this.prismaDatabaseHandler.filter(
      findManyChannelsOperation,
      {
        operationType: 'READ',
        filter,
      },
    );

    return foundChannels.map((channel) =>
      this.channelPersistanceACL.toAggregate(channel),
    );
  }

  async deleteOneById(id: string): Promise<boolean> {
    const deleteChannelByIdOperation = async () => {
      return await this.persistanceService.channel.delete({
        where: { id },
      });
    };

    const deletedChannel = await this.prismaDatabaseHandler.filter(
      deleteChannelByIdOperation,
      {
        operationType: 'DELETE',
        filter: { id },
      },
    );

    return deletedChannel ? true : false;
  }

  async deleteOne(filter: DatabaseFilter<Channel>): Promise<boolean> {
    const deleteChannelOperation = async () => {
      return await this.persistanceService.channel.delete({
        where: this.toPrismaFilter(
          filter,
          'many',
        ) as Prisma.ChannelWhereUniqueInput,
      });
    };

    const deletedChannel = await this.prismaDatabaseHandler.filter(
      deleteChannelOperation,
      {
        operationType: 'DELETE',
        filter,
      },
    );

    return deletedChannel ? true : false;
  }

  async deleteMany(filter: DatabaseFilter<Channel>): Promise<number> {
    const deleteManyChannelsOperation = async () => {
      return await this.persistanceService.channel.deleteMany({
        where: this.toPrismaFilter(filter, 'many') as Prisma.ChannelWhereInput,
      });
    };

    const deletedChannels = await this.prismaDatabaseHandler.filter(
      deleteManyChannelsOperation,
      {
        operationType: 'DELETE',
        filter,
      },
    );

    return deletedChannels.count;
  }
}
