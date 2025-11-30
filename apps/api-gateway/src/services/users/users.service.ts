/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Inject,
  Injectable,
  NotImplementedException,
  OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientGrpc } from '@nestjs/microservices';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import winston from 'winston';
import { Counter } from 'prom-client';
import { firstValueFrom } from 'rxjs';

import { USER_SERVICE_NAME, UserServiceClient } from '@app/contracts/users';
import { SERVICES } from '@app/clients/constant';
import { UserAuthPayload } from '@app/contracts/auth';

import { REQUESTS_COUNTER } from '@gateway/infrastructure/measure';
import { LOGGER_PORT, LoggerPort } from '@gateway/application/ports';

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

@Injectable()
export class UsersService implements OnModuleInit {
  private userService: UserServiceClient;

  constructor(
    @Inject(SERVICES.USER) private readonly userClient: ClientGrpc,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @InjectMetric(REQUESTS_COUNTER) private readonly counter: Counter,
    private jwtService: JwtService,
  ) {}

  onModuleInit() {
    this.userService = this.userClient.getService(USER_SERVICE_NAME);
  }

  async getPresignedUploadUrl(
    preSignedUrlRequestDto: PreSignedUrlRequestDto,
    userId: string,
  ): Promise<PreSignedUrlRequestResponse> {
    this.counter.inc();

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
    });
    const createdUserProfile = await firstValueFrom(response$);
    const userPayload: UserAuthPayload = {
      id: createdUserProfile.userId,
      email: saveUserProfileDto.email,
      authId: saveUserProfileDto.authId,
      handle: saveUserProfileDto.handle,
    };
    // TODO: register Jwt module...
    return { token: this.jwtService.sign(userPayload) };
  }

  async updateUserDetails(
    userId: string,
    userUpdateDto: UpdateUserRequestDto,
  ): Promise<UpdatedUserRequestResponse> {
    this.counter.inc();

    this.logger.info(
      `Update Request has been made:${JSON.stringify(userUpdateDto)}`,
    );

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

  // TODO: fix this by creating a dedicated command in the user service, which will either return the response or return an error...
  async getCurrentlyLoggedInUser(id: string): Promise<FindUserRequestResponse> {
    this.counter.inc();

    this.logger.info(`GET_LOGGED_IN_USER, UserId:${id}`);

    const response$ = this.userService.findOneUserById({ id });
    const response = await firstValueFrom(response$);
    const foundUser = response.user;
    if (!foundUser) {
      throw new Error();
    }
    return foundUser;
  }

  async getAllRegisteredUser(): Promise<FindUserRequestResponse[]> {
    this.logger.info(` All users will be fetched`);

    const response$ = this.userService.findAllUsers({});
    const users = await firstValueFrom(response$);
    const foundUsers = users.userPayload;
    return foundUsers;
  }
}
