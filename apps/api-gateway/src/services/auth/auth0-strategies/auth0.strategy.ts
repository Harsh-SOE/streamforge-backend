import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtraVerificationParams, Profile, Strategy } from 'passport-auth0';

import { AppConfigService } from '@gateway/infrastructure/config';
import { LOGGER_PORT, LoggerPort } from '@gateway/application/ports';

import { GATEWAY_AUTH0_GAURD_STRATEGY, Auth0ProfileUser } from '../types';

@Injectable()
export class Auth0Strategy extends PassportStrategy(
  Strategy,
  GATEWAY_AUTH0_GAURD_STRATEGY,
) {
  constructor(
    private readonly configService: AppConfigService,
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
    profile: Profile & { picture?: string },
  ): Auth0ProfileUser {
    this.logger.info(`Access Token is: ${accessToken}`);
    this.logger.info(`Refresh Token is: ${refreshToken}`);
    this.logger.info(`Profile is: ${JSON.stringify(profile)}`);
    this.logger.info(`Extra params are ${JSON.stringify(extraParams)}`);

    const { id, provider, name, username, photos, emails, birthday } = profile;

    const email = emails?.[0].value;
    const fullName = `${name?.givenName} ${name?.middleName} ${name?.familyName}`;
    const avatar = profile?.picture ?? photos?.[0].value;

    const userAuth0ProfilePayload: Auth0ProfileUser = {
      provider,
      providerId: id,
      email,
      fullName,
      avatar,
      dob: birthday,
      userName: username,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };

    console.log(userAuth0ProfilePayload);

    return userAuth0ProfilePayload;
  }
}
