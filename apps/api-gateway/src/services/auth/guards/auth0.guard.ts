import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GATEWAY_AUTH0_GAURD_STRATEGY } from '../types';

@Injectable()
export class Auth0OAuthGaurd extends AuthGuard(GATEWAY_AUTH0_GAURD_STRATEGY) {
  getAuthenticateOptions() {
    return {
      scope: 'openid profile email offline_access',
      prompt: 'consent',
      access_type: 'offline',
      state: true,
    };
  }

  constructor() {
    super();
    /*
    {
      scope: 'openid profile email',
      accessType: 'offline', // if you want refresh tokens
      prompt: 'consent', // if you want refresh tokens
    }*/
  }
}
