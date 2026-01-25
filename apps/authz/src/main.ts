import { NestFactory } from '@nestjs/core';
import { GrpcOptions } from '@nestjs/microservices';

import { RootModule } from './root.module';
import { AuthzConfigService } from './infrastructure/config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(RootModule);

  const configService = app.get(AuthzConfigService);
  app.connectMicroservice<GrpcOptions>(configService.SERVICE_OPTIONS);

  await app.listen(configService.HTTP_PORT, '0.0.0.0');
  await app.startAllMicroservices();
}
bootstrap()
  .then(() => {
    console.log(`Authz service started successfully`);
  })
  .catch((error) => {
    console.log(`An Error occured while starting the authz service`);
    console.error(error);
    process.exit(1);
  });
