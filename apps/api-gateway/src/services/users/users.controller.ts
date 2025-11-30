import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';

import { UserAuthPayload } from '@app/contracts/auth';

import { GatewayJwtGuard } from '@gateway/infrastructure/jwt/guard';
import { User } from '@gateway/proxies/auth/decorators';

import {
  PreSignedUrlRequestDto,
  CompleteUserProfileDto,
  UpdateUserRequestDto,
} from './request';
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
  constructor(private userService: UsersService) {}

  @UseGuards(GatewayJwtGuard)
  @Post(USER_API.PRESIGNED_URL_AVATAR)
  @Version(USER_API_VERSION.V1)
  getPresignedUrl(
    @Body() FileMetaDataDto: PreSignedUrlRequestDto,
    @User('id') userId: string,
  ): Promise<PreSignedUrlRequestResponse> {
    return this.userService.getPresignedUploadUrl(FileMetaDataDto, userId);
  }

  @Post(USER_API.COMPLETE_PROFILE)
  @Version(USER_API_VERSION.V1)
  async saveUserInDatabase(
    @Body() saveUserProfileDto: CompleteUserProfileDto,
  ): Promise<{
    token: string;
  }> {
    return await this.userService.saveUserInDatabase(saveUserProfileDto);
  }

  @UseGuards(GatewayJwtGuard)
  @Patch(USER_API.UPDATE_DETAILS)
  @Version(USER_API_VERSION.V1)
  updateUserDetails(
    @Body() updateUserDto: UpdateUserRequestDto,
    @User() loggedInUser: UserAuthPayload,
  ): Promise<UpdatedUserRequestResponse> {
    return this.userService.updateUserDetails(loggedInUser.id, updateUserDto);
  }

  @UseGuards(GatewayJwtGuard)
  @Delete(USER_API.DELETE_USER)
  @Version(USER_API_VERSION.V1)
  deleteUser(
    @User() loggedInUser: UserAuthPayload,
  ): Promise<DeleteUserRequestResponse> {
    return this.userService.deleteUser(loggedInUser);
  }

  @UseGuards(GatewayJwtGuard)
  @Get(USER_API.GET_CURRENTLY_LOGGED_IN_USER)
  @Version(USER_API_VERSION.V1)
  GetCurrentlySignedInUser(
    @User() loggedInUser: UserAuthPayload,
  ): Promise<FindUserRequestResponse> {
    return this.userService.getCurrentlyLoggedInUser(loggedInUser.id);
  }

  @UseGuards(GatewayJwtGuard)
  @Get(USER_API.GET_ALL_USERS)
  @Version(USER_API_VERSION.V1)
  getAllRegisteredUser(): Promise<FindUserRequestResponse[]> {
    return this.userService.getAllRegisteredUser();
  }
}
