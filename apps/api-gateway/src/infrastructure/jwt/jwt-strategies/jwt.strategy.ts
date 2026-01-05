import { Inject, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { firstValueFrom } from 'rxjs';

import { SERVICES } from '@app/common';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { QUERY_SERVICE_NAME, QueryServiceClient } from '@app/contracts/query';

import { GatewayConfigService } from '@gateway/infrastructure/config';

import { GATEWAY_GAURD_STRATEGY, UserJwtAuthPayload } from '../types';

@Injectable()
export class JwtStrategy
  extends PassportStrategy(Strategy, GATEWAY_GAURD_STRATEGY)
  implements OnModuleInit
{
  private queryService: QueryServiceClient;

  constructor(
    readonly configService: GatewayConfigService,
    @Inject(SERVICES.USER) private readonly userClient: ClientGrpc,
    @Inject(SERVICES.QUERY) private readonly queryClient: ClientGrpc,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['HS256'],
      secretOrKey: configService.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  onModuleInit() {
    this.queryService = this.queryClient.getService(QUERY_SERVICE_NAME);
  }

  async validate(payload: UserJwtAuthPayload): Promise<UserJwtAuthPayload> {
    const { id, email, authId, handle, avatar } = payload;

    const response$ = this.queryService.getUserProfileFromId({ userId: id });
    const user = await firstValueFrom(response$);

    if (!user) {
      throw new UnauthorizedException(`Invalid token!`);
    }

    const finalUser: UserJwtAuthPayload = {
      id,
      authId,
      email,
      handle,
      avatar,
    };

    return finalUser;
  }
}
