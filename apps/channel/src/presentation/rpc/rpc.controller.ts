import { Observable } from 'rxjs';
import { Controller, Inject, UseFilters } from '@nestjs/common';

import {
  ChannelActivateMonitizationDto,
  ChannelCreatedResponse,
  ChannelCreateDto,
  ChannelMonitizationActivatedResponse,
  ChannelServiceController,
  ChannelServiceControllerMethods,
  ChannelUpdateByIdDto,
  ChannelUpdateByIdResponse,
  ChannelVerifyByIdResponse,
  ChannelVerifyByIdDto,
  GetPresignedUrlDto,
  GetPreSignedUrlResponse,
} from '@app/contracts/channel';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import { GrpcFilter } from '../filters';
import { RpcService } from './rpc.service';

@Controller('channel')
@UseFilters(GrpcFilter)
@ChannelServiceControllerMethods()
export class RpcController implements ChannelServiceController {
  constructor(
    private readonly grpcService: RpcService,
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
}
