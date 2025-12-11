import { NestFactory } from '@nestjs/core';
import { GrpcOptions } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { AppConfigService } from './infrastructure/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(AppConfigService);
  app.connectMicroservice<GrpcOptions>(configService.SERVICE_OPTION);

  await app.listen(configService.HTTP_PORT, '0.0.0.0');
  await app.startAllMicroservices();
}
bootstrap()
  .then(() => console.log(`Comments service started successfully`))
  .catch((err) => {
    console.log(`An error occured while starting the 'Comments' service`);
    console.error(err);
  });
