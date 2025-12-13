import { Controller, Inject, UseFilters } from '@nestjs/common';
import { Observable } from 'rxjs';

import {
  ChannelActivateMonitizationDto,
  ChannelCreatedResponse,
  ChannelCreateDto,
  ChannelFindByIdDto,
  ChannelMonitizationActivatedResponse,
  ChannelServiceController,
  ChannelServiceControllerMethods,
  ChannelUpdateByIdDto,
  ChannelUpdateByIdResponse,
  ChannelVerifyByIdResponse,
  ChannelVerifyByIdDto,
  GetPresignedUrlDto,
  GetPreSignedUrlResponse,
  ChannelFindByUserIdDto,
  ChannelFoundResponse,
} from '@app/contracts/channel';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import { GrpcService } from './grpc.service';
import { GrpcFilter } from '../filters';

@Controller('channel')
@UseFilters(GrpcFilter)
@ChannelServiceControllerMethods()
export class GrpcController implements ChannelServiceController {
  constructor(
    private readonly grpcService: GrpcService,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  getPresignedUrlForFileUpload(
    getPresignedUrlDto: GetPresignedUrlDto,
  ):
    | Promise<GetPreSignedUrlResponse>
    | Observable<GetPreSignedUrlResponse>
    | GetPreSignedUrlResponse {
    return this.grpcService.generatePreSignedUrl(getPresignedUrlDto);
  }

  createChannel(
    channelCreateDto: ChannelCreateDto,
  ): Promise<ChannelCreatedResponse> | Observable<ChannelCreatedResponse> | ChannelCreatedResponse {
    return this.grpcService.createChannel(channelCreateDto);
  }

  activateMonitization(
    channelActivateMonitizationDto: ChannelActivateMonitizationDto,
  ):
    | Promise<ChannelMonitizationActivatedResponse>
    | Observable<ChannelMonitizationActivatedResponse>
    | ChannelMonitizationActivatedResponse {
    return this.grpcService.activateMonitization(channelActivateMonitizationDto);
  }

  findChannelById(
    channelFindByIdDto: ChannelFindByIdDto,
  ): Promise<ChannelFoundResponse> | Observable<ChannelFoundResponse> | ChannelFoundResponse {
    return this.grpcService.findChannelById(channelFindByIdDto);
  }

  channelUpdateById(
    channelUpdateByIdDto: ChannelUpdateByIdDto,
  ):
    | Promise<ChannelUpdateByIdResponse>
    | Observable<ChannelUpdateByIdResponse>
    | ChannelUpdateByIdResponse {
    return this.grpcService.updateChannelById(channelUpdateByIdDto);
  }

  channelVerify(
    channelVerifyByIdDto: ChannelVerifyByIdDto,
  ):
    | Promise<ChannelVerifyByIdResponse>
    | Observable<ChannelVerifyByIdResponse>
    | ChannelVerifyByIdResponse {
    return this.grpcService.channelVerify(channelVerifyByIdDto);
  }

  findChannelByUserId(
    channelFindByUserIdDto: ChannelFindByUserIdDto,
  ): Promise<ChannelFoundResponse> | Observable<ChannelFoundResponse> | ChannelFoundResponse {
    this.logger.info(`Request recieved`, channelFindByUserIdDto);
    return this.grpcService.findChannelByUserId(channelFindByUserIdDto);
  }
}
