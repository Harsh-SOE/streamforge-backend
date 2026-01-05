import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtraVerificationParams, Strategy } from 'passport-auth0';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import { GatewayConfigService } from '@gateway/infrastructure/config';

import { Auth0Profile, GATEWAY_AUTH0_GAURD_STRATEGY, UserProfile } from '../types';

@Injectable()
export class GatewayAuth0Strategy extends PassportStrategy(Strategy, GATEWAY_AUTH0_GAURD_STRATEGY) {
  constructor(
    private readonly configService: GatewayConfigService,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {
    super({
      domain: configService.AUTH0_CLIENT_DOMAIN,
      callbackURL: configService.AUTH0_CALLBACK_URL,
      clientID: configService.AUTH0_CLIENT_ID,
      clientSecret: configService.AUTH0_CLIENT_SECRET,
      state: true,
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    extraParams: ExtraVerificationParams,
    profile: Auth0Profile,
  ): UserProfile {
    const { id, provider, name, emails, displayName, picture: avatar } = profile;

    // email
    const validEmails = emails
      ? emails
          ?.filter((email) => email.value && email.value.trim().length > 0)
          .map((email) => email.value.trim())
      : [];
    const email = validEmails.length > 0 ? validEmails[0] : '';
    if (!email) {
      throw new UnauthorizedException(`Auth0 Error: No Email id was provided`);
    }

    // fullname
    const nameParts = [name?.givenName, name?.middleName, name?.familyName];
    const validNameParts = nameParts
      .filter((name) => name && name.trim().length > 0)
      .map((name) => name?.trim());
    const fullName = displayName ?? validNameParts.join(' ');
    if (!fullName) {
      throw new UnauthorizedException(`Auth0 Error: No Name was provided`);
    }

    if (!avatar) {
      throw new UnauthorizedException(`Auth0 Error: No Avatar was provided`);
    }

    const userProfile: UserProfile = {
      provider,
      providerId: id,
      email,
      fullName,
      avatar,
    };

    return userProfile;
  }
}
