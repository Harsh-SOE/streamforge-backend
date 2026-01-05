/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable, NotImplementedException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { SERVICES } from '@app/common';
import { UserAuthPayload } from '@app/contracts/auth';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { USER_SERVICE_NAME, UserServiceClient } from '@app/contracts/users';

import { PreSignedUrlRequestDto, CompleteUserProfileDto, UpdateUserRequestDto } from './request';
import {
  DeleteUserRequestResponse,
  FindUserRequestResponse,
  PreSignedUrlRequestResponse,
  UpdatedUserRequestResponse,
} from './response';

@Injectable()
export class UsersService implements OnModuleInit {
  private userService: UserServiceClient;

  constructor(
    @Inject(SERVICES.USER) private readonly userClient: ClientGrpc,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private jwtService: JwtService,
  ) {}

  onModuleInit() {
    this.userService = this.userClient.getService(USER_SERVICE_NAME);
  }

  async getPresignedUploadUrl(
    preSignedUrlRequestDto: PreSignedUrlRequestDto,
    userId: string,
  ): Promise<PreSignedUrlRequestResponse> {
    const result$ = this.userService.getPresignedUrlForFileUpload({
      ...preSignedUrlRequestDto,
      userId,
    });
    return await firstValueFrom(result$);
  }

  async saveUserInDatabase(saveUserProfileDto: CompleteUserProfileDto) {
    const response$ = this.userService.createProfile({
      authId: saveUserProfileDto.authId,
      email: saveUserProfileDto.email,
      handle: saveUserProfileDto.handle,
      avatar: saveUserProfileDto.avatar,
    });
    const createdUserProfile = await firstValueFrom(response$);
    const userPayload: UserAuthPayload = {
      id: createdUserProfile.userId,
      email: saveUserProfileDto.email,
      authId: saveUserProfileDto.authId,
      handle: saveUserProfileDto.handle,
      avatar: saveUserProfileDto.avatar,
    };
    // TODO Correct the auth flow
    return { token: this.jwtService.sign(userPayload) };
  }

  async updateUserDetails(
    userId: string,
    userUpdateDto: UpdateUserRequestDto,
  ): Promise<UpdatedUserRequestResponse> {
    this.logger.info(`Update Request has been made:${JSON.stringify(userUpdateDto)}`);

    const response$ = this.userService.updateProfile({
      ...userUpdateDto,
      id: userId,
    });
    return await firstValueFrom(response$);
  }

  deleteUser(user: UserAuthPayload): Promise<DeleteUserRequestResponse> {
    // INFO: NOT IMPLEMENTED: Implement saga distributed transaction
    throw new NotImplementedException(`Delete user is not yet implemented!`);
  }

  getCurrentlyLoggedInUser(id: string): Promise<FindUserRequestResponse> {
    throw new NotImplementedException(
      `Please implement 'getCurrentlyLoggedInUser' before using it`,
    );
  }

  getAllRegisteredUser(): Promise<FindUserRequestResponse[]> {
    throw new NotImplementedException(`Please implement 'getAllRegisteredUser' before using it`);
  }
}
