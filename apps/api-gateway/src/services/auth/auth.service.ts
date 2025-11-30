import { Response } from 'express';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { firstValueFrom } from 'rxjs';
import { Counter } from 'prom-client';

import { SERVICES } from '@app/clients/constant';
import { USER_SERVICE_NAME, UserServiceClient } from '@app/contracts/users';
import { UserAuthPayload } from '@app/contracts/auth';

import { LOGGER_PORT, LoggerPort } from '@gateway/application/ports';
import { REQUESTS_COUNTER } from '@gateway/infrastructure/measure';
import { Auth0ProfileUser } from '@gateway/proxies/auth/types';
import { AppConfigService } from '@gateway/infrastructure/config';

@Injectable()
export class AuthService implements OnModuleInit {
  private userService: UserServiceClient;

  constructor(
    @Inject(SERVICES.USER) private readonly userClient: ClientGrpc,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @InjectMetric(REQUESTS_COUNTER) private readonly counter: Counter,
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
  ) {}

  onModuleInit() {
    this.userService = this.userClient.getService(USER_SERVICE_NAME);
  }

  async onAuthRedirect(
    userAuthCredentials: Auth0ProfileUser,
    response: Response,
  ): Promise<void> {
    this.logger.info(
      `User Auth Credentials are: ${JSON.stringify(userAuthCredentials)}`,
    );

    const response$ = this.userService.findUserByAuthId({
      authId: userAuthCredentials.providerId,
    });
    const userFoundResponse = await firstValueFrom(response$);

    const foundUser = userFoundResponse.user;

    if (!foundUser) {
      this.logger.info(`No User found in user's database...`);

      const cookiePayload = {
        response:
          'Please complete your profile inorder to login to application [STATUS: Signup-SUCCESS]',
        token: undefined,
        userInfo: {
          email: userAuthCredentials.email,
          authId: userAuthCredentials.providerId,
        },
      };
      response.cookie('onboarding_info', JSON.stringify(cookiePayload), {
        httpOnly: false,
        secure:
          this.configService.NODE_ENVIRONMENT === 'production' ? true : false,
        sameSite: 'lax',
        path: '/',
        maxAge: 1000 * 60 * 5,
      });

      return response.redirect('http://localhost:4545/onboard');
    }

    // user exists...

    const loggedInUserPayload: UserAuthPayload = {
      id: foundUser.id,
      authId: userAuthCredentials.providerId,
      email: foundUser.email,
      handle: foundUser.handle,
    };

    const token = this.jwtService.sign(loggedInUserPayload);

    response.cookie('access_token', token, {
      httpOnly: true,
      secure:
        this.configService.NODE_ENVIRONMENT === 'production' ? true : false,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,
      path: '/',
    });

    response.cookie('user_meta', JSON.stringify(loggedInUserPayload), {
      httpOnly: false,
      secure:
        this.configService.NODE_ENVIRONMENT === 'production' ? true : false,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 5,
    });

    return response.redirect('http://localhost:4545/homepage');
  }
}
