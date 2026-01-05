import { Inject } from '@nestjs/common';
import { EmailParams, MailerSend, Recipient, Sender } from 'mailersend';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import { EmailPort, SendMailOptions } from '@email/application/ports';
import { EmailConfigService } from '@email/infrastructure/config';

export class MailerSendEmailAdapter implements EmailPort {
  client: MailerSend;

  constructor(
    private readonly configService: EmailConfigService,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {
    this.client = new MailerSend({
      apiKey: this.configService.EMAIL_API_KEY,
    });
  }

  async sendEmail(options: SendMailOptions): Promise<void> {
    const { to, subject, content } = options;

    const sentFrom = new Sender(this.configService.FROM_EMAIL);

    const recipients = [new Recipient(to)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(subject)
      .setHtml(content);

    const response = await this.client.email.send(emailParams);

    this.logger.info(`Email sent to ${to}...`, response);
  }
}
