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
import { Auth0ProfileUser } from '@gateway/services/auth/types';
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
          avatar:
            userAuthCredentials.avatar ||
            'https://www.google.com/imgres?q=user%20avatar&imgurl=https%3A%2F%2Fpng.pngtree.com%2Fpng-vector%2F20190710%2Fourmid%2Fpngtree-user-vector-avatar-png-image_1541962.jpg&imgrefurl=https%3A%2F%2Fpngtree.com%2Fso%2Fuser-avatar&docid=4N-ldCWOe1oafM&tbnid=nnEzJXp8VNSC_M&vet=12ahUKEwj_zNytyZuRAxWlT2wGHYiYHPgQM3oECBYQAA..i&w=360&h=360&hcb=2&ved=2ahUKEwj_zNytyZuRAxWlT2wGHYiYHPgQM3oECBYQAA',
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

    const userMetaData = {
      id: foundUser.id,
      email: foundUser.email,
      avatar:
        userAuthCredentials.avatar ||
        'https://www.google.com/imgres?q=user%20avatar&imgurl=https%3A%2F%2Fpng.pngtree.com%2Fpng-vector%2F20190710%2Fourmid%2Fpngtree-user-vector-avatar-png-image_1541962.jpg&imgrefurl=https%3A%2F%2Fpngtree.com%2Fso%2Fuser-avatar&docid=4N-ldCWOe1oafM&tbnid=nnEzJXp8VNSC_M&vet=12ahUKEwj_zNytyZuRAxWlT2wGHYiYHPgQM3oECBYQAA..i&w=360&h=360&hcb=2&ved=2ahUKEwj_zNytyZuRAxWlT2wGHYiYHPgQM3oECBYQAA',
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

    response.cookie('user_meta', JSON.stringify(userMetaData), {
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
