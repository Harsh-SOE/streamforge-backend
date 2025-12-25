import { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ClientGrpc } from '@nestjs/microservices';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { SERVICES } from '@app/clients/constant';
import { UserAuthPayload } from '@app/contracts/auth';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { USER_SERVICE_NAME, UserServiceClient } from '@app/contracts/users';
import { QUERY_SERVICE_NAME, QueryServiceClient, UserProfileMessage } from '@app/contracts/query';

import { UserProfile } from '@gateway/infrastructure/oauth/types';
import { ENVIRONMENT, GatewayConfigService } from '@gateway/infrastructure/config';

const ONBOARDING_INFO_COOKIE_NAME = 'onboarding_info';
const ACCESS_TOKEN_COOKIE_NAME = 'access_info';
const USER_METADATA_COOKIE_NAME = 'user_metadata';

@Injectable()
export class AuthService implements OnModuleInit {
  private userService: UserServiceClient;
  private queryService: QueryServiceClient;

  constructor(
    @Inject(SERVICES.USER) private readonly userClient: ClientGrpc,
    @Inject(SERVICES.QUERY) private readonly queryClient: ClientGrpc,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private readonly jwtService: JwtService,
    private readonly configService: GatewayConfigService,
  ) {}

  onModuleInit() {
    this.userService = this.userClient.getService(USER_SERVICE_NAME);
    this.queryService = this.queryClient.getService(QUERY_SERVICE_NAME);
  }

  private prepareAndSendOnboardingCookie(response: Response, userAuthCredentials: UserProfile) {
    const onBoardingCookie = {
      authId: userAuthCredentials.providerId,
      email: userAuthCredentials.email,
      avatar: userAuthCredentials.avatar,
    };

    response.cookie(ONBOARDING_INFO_COOKIE_NAME, JSON.stringify(onBoardingCookie), {
      httpOnly: false,
      secure: this.configService.NODE_ENVIRONMENT === ENVIRONMENT.PRODUCTION,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 5,
    });
  }

  private prepareAndSendAccessTokenCookie(response: Response, foundUser: UserProfileMessage) {
    const signedUpUserPayload: UserAuthPayload = {
      id: foundUser.userId,
      authId: foundUser.userAuthId,
      email: foundUser.email,
      handle: foundUser.handle,
      avatar: foundUser.avatar,
    };

    const token = this.jwtService.sign(signedUpUserPayload);

    response.cookie(ACCESS_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: this.configService.NODE_ENVIRONMENT === ENVIRONMENT.PRODUCTION,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,
      path: '/',
    });
  }

  private prepareAndSendUserMetadata(response: Response, foundUser: UserProfileMessage) {
    const userMetaData = {
      id: foundUser.userId,
      email: foundUser.email,
      avatar: foundUser.avatar,
      handle: foundUser.handle,
      hasChannel: foundUser.hasChannel,
    };

    response.cookie(USER_METADATA_COOKIE_NAME, JSON.stringify(userMetaData), {
      httpOnly: false,
      secure: this.configService.NODE_ENVIRONMENT === ENVIRONMENT.PRODUCTION,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 5,
    });
  }

  async onAuthRedirect(userAuthCredentials: UserProfile, response: Response): Promise<void> {
    this.logger.info('User from auth0', userAuthCredentials);

    const responseUserProjection$ = this.queryService.getUserProfileFromAuthId({
      userAuthId: userAuthCredentials.providerId,
    });

    // TODO
    /* Check in the user service database to confirm that there is no inconsistency in the system */

    const projectedUserResponse = await firstValueFrom(responseUserProjection$);

    this.logger.info(`User is`, projectedUserResponse);

    const foundUser = projectedUserResponse.user;

    if (!foundUser) {
      this.logger.info(`No User found in user's database...`);
      this.prepareAndSendOnboardingCookie(response, userAuthCredentials);
      const ONBOARDING_PAGE = this.configService.FRONTEND_URL + '/auth';
      return response.redirect(ONBOARDING_PAGE);
    }

    this.prepareAndSendAccessTokenCookie(response, foundUser);
    this.prepareAndSendUserMetadata(response, foundUser);

    const HOME_PAGE = this.configService.FRONTEND_URL + '/homepage';
    return response.redirect(HOME_PAGE);
  }
}
