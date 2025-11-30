import {
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';

import { USER_SERVICE_NAME, UserServiceClient } from '@app/contracts/users';
import { SERVICES } from '@app/clients/constant';

import { AppConfigService } from '@gateway/infrastructure/config';

import { GATEWAY_GAURD_STRATEGY, UserAuthPayload } from '../types';

@Injectable()
export class JwtStrategy
  extends PassportStrategy(Strategy, GATEWAY_GAURD_STRATEGY)
  implements OnModuleInit
{
  private userService: UserServiceClient;

  constructor(
    readonly configService: AppConfigService,
    @Inject(SERVICES.USER) private readonly userClient: ClientGrpc,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          const data = request?.cookies as Record<string, string> | undefined;
          return data?.access_token || null;
        },
      ]),
      ignoreExpiration: false,
      algorithms: ['HS256'],
      secretOrKey: configService.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  onModuleInit() {
    this.userService = this.userClient.getService(USER_SERVICE_NAME);
  }

  async validate(payload: UserAuthPayload): Promise<UserAuthPayload> {
    const { id, email, authId, handle } = payload;
    console.log(`---> GUARDED ROUTE <---`);
    const response$ = this.userService.findOneUserById({ id });
    const user = await firstValueFrom(response$);
    console.log(user);

    if (!user) {
      throw new UnauthorizedException(`Complete Profile inorder to continue!`);
    }

    const finalUser: UserAuthPayload = {
      id,
      authId,
      email,
      handle,
    };
    return finalUser;
  }
}
