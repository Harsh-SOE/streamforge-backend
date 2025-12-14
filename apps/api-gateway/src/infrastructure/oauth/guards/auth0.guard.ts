import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GATEWAY_AUTH0_GAURD_STRATEGY } from '../types';

@Injectable()
export class Auth0OAuthGaurd extends AuthGuard(GATEWAY_AUTH0_GAURD_STRATEGY) {
  getAuthenticateOptions() {
    return {
      scope: 'openid profile email offline_access',
      access_type: 'offline',
      state: true,
    };
  }
}
