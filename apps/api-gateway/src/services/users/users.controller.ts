import { Body, Controller, Delete, Get, Patch, Post, UseGuards, Version } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

import { UserAuthPayload } from '@app/contracts/auth';

import { GatewayJwtGuard } from '@gateway/infrastructure/jwt/guard';
import { REQUESTS_COUNTER } from '@gateway/infrastructure/measure';
import { User } from '@gateway/services/auth/decorators';

import { PreSignedUrlRequestDto, CompleteUserProfileDto, UpdateUserRequestDto } from './request';
import {
  DeleteUserRequestResponse,
  FindUserRequestResponse,
  PreSignedUrlRequestResponse,
  UpdatedUserRequestResponse,
} from './response';
import { UsersService } from './users.service';
import { USER_API, USER_API_VERSION } from './api';

@Controller('users')
export class UsersController {
  constructor(
    private userService: UsersService,
    @InjectMetric(REQUESTS_COUNTER) private readonly counter: Counter,
  ) {}

  @UseGuards(GatewayJwtGuard)
  @Post(USER_API.PRESIGNED_URL_AVATAR)
  @Version(USER_API_VERSION.V1)
  getPresignedUrl(
    @Body() FileMetaDataDto: PreSignedUrlRequestDto,
    @User('id') userId: string,
  ): Promise<PreSignedUrlRequestResponse> {
    this.counter.inc();
    return this.userService.getPresignedUploadUrl(FileMetaDataDto, userId);
  }

  @Post(USER_API.COMPLETE_PROFILE)
  @Version(USER_API_VERSION.V1)
  async saveUserInDatabase(@Body() saveUserProfileDto: CompleteUserProfileDto): Promise<{
    token: string;
  }> {
    this.counter.inc();
    return await this.userService.saveUserInDatabase(saveUserProfileDto);
  }

  @UseGuards(GatewayJwtGuard)
  @Patch(USER_API.UPDATE_DETAILS)
  @Version(USER_API_VERSION.V1)
  updateUserDetails(
    @Body() updateUserDto: UpdateUserRequestDto,
    @User() loggedInUser: UserAuthPayload,
  ): Promise<UpdatedUserRequestResponse> {
    this.counter.inc();
    return this.userService.updateUserDetails(loggedInUser.id, updateUserDto);
  }

  @UseGuards(GatewayJwtGuard)
  @Delete(USER_API.DELETE_USER)
  @Version(USER_API_VERSION.V1)
  deleteUser(@User() loggedInUser: UserAuthPayload): Promise<DeleteUserRequestResponse> {
    this.counter.inc();
    return this.userService.deleteUser(loggedInUser);
  }

  @UseGuards(GatewayJwtGuard)
  @Get(USER_API.GET_CURRENTLY_LOGGED_IN_USER)
  @Version(USER_API_VERSION.V1)
  GetCurrentlySignedInUser(
    @User() loggedInUser: UserAuthPayload,
  ): Promise<FindUserRequestResponse> {
    this.counter.inc();
    return this.userService.getCurrentlyLoggedInUser(loggedInUser.id);
  }

  @UseGuards(GatewayJwtGuard)
  @Get(USER_API.GET_ALL_USERS)
  @Version(USER_API_VERSION.V1)
  getAllRegisteredUser(): Promise<FindUserRequestResponse[]> {
    this.counter.inc();
    return this.userService.getAllRegisteredUser();
  }
}
