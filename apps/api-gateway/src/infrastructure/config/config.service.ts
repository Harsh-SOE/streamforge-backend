import { Injectable } from '@nestjs/common';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { join } from 'path';

import { USER_PACKAGE_NAME } from '@app/contracts/users';
import { VIDEO_PACKAGE_NAME } from '@app/contracts/videos';
import { VIEWS_PACKAGE_NAME } from '@app/contracts/views';
import { COMMENT_PACKAGE_NAME } from '@app/contracts/comments';
import { CHANNEL_PACKAGE_NAME } from '@app/contracts/channel';
import { REACTION_PACKAGE_NAME } from '@app/contracts/reaction';
import { QUERY_PACKAGE_NAME } from '@app/contracts/query';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get NODE_ENVIRONMENT() {
    return this.configService.getOrThrow<string>('NODE_ENVIRONMENT');
  }

  get PORT() {
    return this.configService.getOrThrow<number>('PORT');
  }

  get GRAFANA_LOKI_URL() {
    return this.configService.getOrThrow<string>('GRAFANA_LOKI_URL');
  }

  get FRONTEND_URL() {
    return this.configService.getOrThrow<string>('FRONTEND_URL');
  }

  get JWT_ACCESS_TOKEN_SECRET() {
    return this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET');
  }

  get JWT_ACCESS_TOKEN_EXPIRY() {
    return this.configService.getOrThrow<number>('JWT_ACCESS_TOKEN_EXPIRY');
  }

  get USER_SERVICE_PORT() {
    return this.configService.getOrThrow<number>('USER_SERVICE_PORT');
  }

  get USER_SERVICE_HOST() {
    return this.configService.getOrThrow<string>('USER_SERVICE_HOST');
  }

  get CHANNEL_SERVICE_PORT() {
    return this.configService.getOrThrow<number>('CHANNEL_SERVICE_PORT');
  }

  get CHANNEL_SERVICE_HOST() {
    return this.configService.getOrThrow<string>('CHANNEL_SERVICE_HOST');
  }

  get REACTION_SERVICE_PORT() {
    return this.configService.getOrThrow<number>('REACTION_SERVICE_PORT');
  }

  get REACTION_SERVICE_HOST() {
    return this.configService.getOrThrow<string>('REACTION_SERVICE_HOST');
  }

  get VIDEO_SERVICE_PORT() {
    return this.configService.getOrThrow<number>('VIDEO_SERVICE_PORT');
  }

  get VIDEO_SERVICE_HOST() {
    return this.configService.getOrThrow<string>('VIDEO_SERVICE_HOST');
  }

  get COMMENT_SERVICE_PORT() {
    return this.configService.getOrThrow<number>('COMMENT_SERVICE_PORT');
  }

  get COMMENT_SERVICE_HOST() {
    return this.configService.getOrThrow<string>('COMMENT_SERVICE_HOST');
  }

  get REDIS_HOST() {
    return this.configService.getOrThrow<string>('REDIS_HOST');
  }

  get REDIS_PORT() {
    return this.configService.getOrThrow<number>('REDIS_PORT');
  }

  get WATCH_SERVICE_HOST() {
    return this.configService.getOrThrow<string>('WATCH_SERVICE_HOST');
  }

  get WATCH_SERVICE_PORT() {
    return this.configService.getOrThrow<number>('WATCH_SERVICE_PORT');
  }

  get QUERY_SERVICE_PORT() {
    return this.configService.getOrThrow<number>('QUERY_SERVICE_PORT');
  }

  get QUERY_SERVICE_HOST() {
    return this.configService.getOrThrow<string>('QUERY_SERVICE_HOST');
  }

  get AUTH0_CLIENT_ID() {
    return this.configService.getOrThrow<string>('AUTH0_CLIENT_ID');
  }

  get AUTH0_CLIENT_SECRET() {
    return this.configService.getOrThrow<string>('AUTH0_CLIENT_SECRET');
  }

  get AUTH0_CLIENT_DOMAIN() {
    return this.configService.getOrThrow<string>('AUTH0_CLIENT_DOMAIN');
  }

  get AUTH0_DATABASE_NAME() {
    return this.configService.getOrThrow<string>('AUTH0_DATABASE_NAME');
  }

  get AUTH0_CALLBACK_URL() {
    return this.configService.getOrThrow<string>('AUTH0_CALLBACK_URL');
  }

  get EXPRESS_SESSION_SECRET() {
    return this.configService.getOrThrow<string>('EXPRESS_SESSION_SECRET');
  }

  get JWT_TOKEN_OPTIONS() {
    const options: JwtModuleOptions = {
      secret: this.JWT_ACCESS_TOKEN_SECRET,
      signOptions: {
        algorithm: 'HS256',
        expiresIn: this.JWT_ACCESS_TOKEN_EXPIRY,
      },
    };
    return options;
  }

  get REACTION_SERVICE_OPTIONS(): GrpcOptions {
    return {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, 'proto/reaction.proto'),
        package: REACTION_PACKAGE_NAME,
        url: `${this.REACTION_SERVICE_HOST}:${this.REACTION_SERVICE_PORT}`,
      },
    };
  }

  get VIDEO_SERVICE_OPTIONS(): GrpcOptions {
    return {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, 'proto/videos.proto'),
        package: VIDEO_PACKAGE_NAME,
        url: `${this.VIDEO_SERVICE_HOST}:${this.VIDEO_SERVICE_PORT}`,
      },
    };
  }

  get USER_SERVICE_OPTIONS(): GrpcOptions {
    return {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, 'proto/users.proto'),
        package: USER_PACKAGE_NAME,
        url: `${this.USER_SERVICE_HOST}:${this.USER_SERVICE_PORT}`,
      },
    };
  }

  get QUERY_SERVICE_OPTIONS(): GrpcOptions {
    return {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, 'proto/query.proto'),
        package: QUERY_PACKAGE_NAME,
        url: `${this.QUERY_SERVICE_HOST}:${this.QUERY_SERVICE_PORT}`,
      },
    };
  }

  get CHANNEL_SERVICE_OPTIONS(): GrpcOptions {
    return {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, 'proto/channel.proto'),
        package: CHANNEL_PACKAGE_NAME,
        url: `${this.CHANNEL_SERVICE_HOST}:${this.CHANNEL_SERVICE_PORT}`,
      },
    };
  }

  get COMMENT_SERVICE_OPTIONS(): GrpcOptions {
    return {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, 'proto/comments.proto'),
        package: COMMENT_PACKAGE_NAME,
        url: `${this.COMMENT_SERVICE_HOST}:${this.COMMENT_SERVICE_PORT}`,
      },
    };
  }

  get WATCH_SERVICE_OPTION(): GrpcOptions {
    return {
      transport: Transport.GRPC,
      options: {
        package: VIEWS_PACKAGE_NAME,
        protoPath: join(__dirname, 'proto/views.proto'),
        url: `${this.WATCH_SERVICE_HOST}:${this.WATCH_SERVICE_PORT}`,
      },
    };
  }
}
