import { DomainException } from '@app/common/exceptions/payload/base';

export interface InvalidValueOjectExceptionOptions {
  message?: string;
  meta?: Record<string, any>;
}

export class InvalidValueObjectException extends DomainException {
  public constructor(options: InvalidValueOjectExceptionOptions) {
    const { message = `Invalid value for value object was recieved`, meta } = options || {};
    super({
      code: 'INVALID_INPUT_EXCEPTION',
      message: message,
      meta,
    });
  }
}
