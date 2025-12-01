import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { USERS } from '@app/clients';

import { KafkaService } from './kafka.service';

@Controller('projection')
export class KafkaController {
  public constructor(private readonly kafkaService: KafkaService) {}

  @EventPattern(USERS.USER_ONBOARDED_EVENT)
  saveUserInProjection(@Payload() message: any) {}
}
