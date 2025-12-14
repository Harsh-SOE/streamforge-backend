import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { GatewayAuth0Strategy } from '@gateway/infrastructure/oauth/auth0-strategies';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  imports: [PassportModule.register({ defaultStrategy: 'auth0', session: true })],
  providers: [AuthService, GatewayAuth0Strategy],
})
export class AuthModule {}
