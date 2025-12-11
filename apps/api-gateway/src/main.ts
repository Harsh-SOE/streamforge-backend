import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { AppConfigService } from './infrastructure/config';
import { GatewayExceptionFilter } from './persentation/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<AppConfigService>(AppConfigService);
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
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
        secure: false,
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
