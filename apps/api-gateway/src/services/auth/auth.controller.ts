import { Response } from 'express';
import { Controller, Get, Res, UseGuards, Version } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

import { User } from '@gateway/common/decorators';
import { REQUESTS_COUNTER } from '@gateway/infrastructure/measure';
import { UserProfile } from '@gateway/infrastructure/oauth/types';
import { Auth0OAuthGaurd } from '@gateway/infrastructure/oauth/guards';
import { AUTH_API_ENDPOINTS, AUTH_API_VERSION } from '@gateway/common/endpoints';

import { AuthService } from './auth.service';

@Controller(AUTH_API_ENDPOINTS.ROOT)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectMetric(REQUESTS_COUNTER) private readonly counter: Counter,
  ) {}

  @UseGuards(Auth0OAuthGaurd)
  @Get(AUTH_API_ENDPOINTS.AUTHENTICATE)
  @Version(AUTH_API_VERSION.VERSION_1)
  authenticate() {}

  @UseGuards(Auth0OAuthGaurd)
  @Get(AUTH_API_ENDPOINTS.AUTH0_REDIRECT)
  @Version(AUTH_API_VERSION.VERSION_1)
  onAuthRedirect(@User() auth0User: UserProfile, @Res() response: Response): Promise<void> {
    this.counter.inc();
    return this.authService.onAuthRedirect(auth0User, response);
  }
}
