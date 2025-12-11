import { Response } from 'express';
import { Controller, Get, Res, UseGuards, Version } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

import { User } from '@gateway/services/auth/decorators';
import { Auth0ProfileUser } from '@gateway/services/auth/types';
import { Auth0OAuthGaurd } from '@gateway/services/auth/guards';
import { REQUESTS_COUNTER } from '@gateway/infrastructure/measure';

import { AuthService } from './auth.service';
import { AUTH_API_VERSION, AUTH_API } from './api';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectMetric(REQUESTS_COUNTER) private readonly counter: Counter,
  ) {}

  @UseGuards(Auth0OAuthGaurd)
  @Get(AUTH_API.AUTHENTICATE)
  @Version(AUTH_API_VERSION.V1)
  authenticate() {}

  @UseGuards(Auth0OAuthGaurd)
  @Get(AUTH_API.AUTH0_REDIRECT)
  @Version(AUTH_API_VERSION.V1)
  onAuthRedirect(
    @User() auth0User: Auth0ProfileUser,
    @Res() response: Response,
  ): Promise<void> {
    this.counter.inc();
    return this.authService.onAuthRedirect(auth0User, response);
  }
}
