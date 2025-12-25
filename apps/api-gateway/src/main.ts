import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';

import { RootModule } from './root.module';
import { GatewayExceptionFilter } from './persentation/filters';
import { ENVIRONMENT, GatewayConfigService } from './infrastructure/config';

async function bootstrap() {
  const app = await NestFactory.create(RootModule);
  const configService = app.get<GatewayConfigService>(GatewayConfigService);

  app.use(cookieParser());

  app.useGlobalFilters(new GatewayExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.enableCors({
    origin: configService.FRONTEND_URL,
    credentials: true,
  });

  app.use(
    session({
      secret: configService.EXPRESS_SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: configService.COOKIE_MAX_AGE,
        httpOnly: true,
        secure: configService.NODE_ENVIRONMENT === ENVIRONMENT.PRODUCTION,
        sameSite: 'lax',
      },
    }),
  );

  app.use(passport.initialize());

  app.use(passport.session());

  await app.listen(configService.PORT, '0.0.0.0');
}

bootstrap()
  .then(() => {
    console.log(`Gateway started successfully`);
  })
  .catch((error) => {
    console.log(`An error occured while starting gateway`);
    console.error(error);
    process.exit(1);
  });
