import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { USERS } from '@app/clients';
import { CreatedUserMessageDto } from '@app/contracts/email';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import { KafkaService } from './kafka.service';

@Controller()
export class KafkaController {
  constructor(
    private readonly emailService: KafkaService,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  @EventPattern(USERS.USER_ONBOARDED_EVENT)
  sendEMail(@Payload() message: CreatedUserMessageDto) {
    return this.emailService.sendEMail(message);
  }
}
