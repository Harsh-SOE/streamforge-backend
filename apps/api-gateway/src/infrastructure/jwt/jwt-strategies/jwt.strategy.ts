import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';

import { SERVICES } from '@app/common';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { READ_QUERY_SERVICE_NAME, ReadQueryServiceClient } from '@app/contracts/protocols/read';

import { GatewayConfigService } from '@gateway/infrastructure/config';

import { GATEWAY_GAURD_STRATEGY, UserJwtAuthPayload } from '../types';

@Injectable()
export class JwtStrategy
  extends PassportStrategy(Strategy, GATEWAY_GAURD_STRATEGY)
  implements OnModuleInit
{
  private queryService: ReadQueryServiceClient;

  constructor(
    readonly configService: GatewayConfigService,
    @Inject(SERVICES.USER) private readonly userClient: ClientGrpc,
    @Inject(SERVICES.READ) private readonly queryClient: ClientGrpc,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          const data = request?.cookies as Record<string, string> | undefined;
          return data?.access_info ?? null;
        },
      ]),
      ignoreExpiration: false,
      algorithms: ['HS256'],
      secretOrKey: configService.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  onModuleInit() {
    this.queryService = this.queryClient.getService(READ_QUERY_SERVICE_NAME);
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
