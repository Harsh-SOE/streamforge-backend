import { NestFactory } from '@nestjs/core';
import { GrpcOptions } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { AppConfigService } from './infrastructure/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(AppConfigService);
  app.connectMicroservice<GrpcOptions>(configService.GRPC_OPTIONS);

  await app.listen(configService.HTTP_PORT, '0.0.0.0');
  await app.startAllMicroservices();
}
bootstrap()
  .then(() => {
    console.log(`Query microservice started successfully`);
  })
  .catch((error) => {
    console.log(`An Error occured while starting the query service`);
    console.error(error);
    process.exit(1);
  });
