import { DomainException } from '@app/common/exceptions/payload/base';

export interface InvalidChannelIdExceptionOptions {
  message?: string;
  meta?: Record<string, any>;
}

export class InvalidChannelIdException extends DomainException {
  public constructor(options: InvalidChannelIdExceptionOptions) {
    const { message = `Invalid channel id was received`, meta } = options || {};
    super({
      code: 'INVALID_INPUT_EXCEPTION',
      message: message,
      meta,
    });
  }
}
