import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import {
  ChannelActivateMonitizationDto,
  ChannelCreateDto,
  ChannelFindByIdDto,
  ChannelFoundResponse,
  ChannelMonitizationActivatedResponse,
  ChannelCreatedResponse,
  ChannelUpdateByIdDto,
  ChannelUpdateByIdResponse,
  ChannelVerifyByIdResponse,
  ChannelVerifyByIdDto,
  GetPresignedUrlDto,
  GetPreSignedUrlResponse,
  ChannelFindByUserIdDto,
} from '@app/contracts/channel';

import {
  ActivateMonitizationCommand,
  CreateChannelCommand,
  GeneratePreSignedUrlCommand,
  UpdateChannelCommand,
  VerifyChannelCommand,
} from '@channel/application/commands';
import { FindChannelByIdQuery, FindChannelByUserIdQuery } from '@channel/application/queries';

@Injectable()
export class GrpcService {
  public constructor(
    public readonly commandBus: CommandBus,
    public readonly queryBus: QueryBus,
  ) {}

  generatePreSignedUrl(
    generatePreSignedUrlDto: GetPresignedUrlDto,
  ): Promise<GetPreSignedUrlResponse> {
    return this.commandBus.execute<GeneratePreSignedUrlCommand, GetPreSignedUrlResponse>(
      new GeneratePreSignedUrlCommand(generatePreSignedUrlDto),
    );
  }

  public createChannel(channelCreateDto: ChannelCreateDto): Promise<ChannelCreatedResponse> {
    return this.commandBus.execute<CreateChannelCommand, ChannelCreatedResponse>(
      new CreateChannelCommand(channelCreateDto),
    );
  }

  public activateMonitization(
    channelActivateMonitizationDto: ChannelActivateMonitizationDto,
  ): Promise<ChannelMonitizationActivatedResponse> {
    return this.commandBus.execute<
      ActivateMonitizationCommand,
      ChannelMonitizationActivatedResponse
    >(new ActivateMonitizationCommand(channelActivateMonitizationDto));
  }

  public updateChannelById(
    updateChannelByIdDto: ChannelUpdateByIdDto,
  ): Promise<ChannelUpdateByIdResponse> {
    return this.commandBus.execute<UpdateChannelCommand, ChannelUpdateByIdResponse>(
      new UpdateChannelCommand(updateChannelByIdDto),
    );
  }

  public findChannelById(channelFindByIdDto: ChannelFindByIdDto): Promise<ChannelFoundResponse> {
    return this.queryBus.execute<FindChannelByIdQuery, ChannelFoundResponse>(
      new FindChannelByIdQuery(channelFindByIdDto),
    );
  }

  public channelVerify(
    channelVerifyByIdDto: ChannelVerifyByIdDto,
  ): Promise<ChannelVerifyByIdResponse> {
    return this.commandBus.execute<VerifyChannelCommand, ChannelVerifyByIdResponse>(
      new VerifyChannelCommand(channelVerifyByIdDto),
    );
  }

  public findChannelByUserId(
    channelFindByUserIdDto: ChannelFindByUserIdDto,
  ): Promise<ChannelFoundResponse> {
    return this.queryBus.execute<FindChannelByUserIdQuery, ChannelFoundResponse>(
      new FindChannelByUserIdQuery(channelFindByUserIdDto),
    );
  }
}
