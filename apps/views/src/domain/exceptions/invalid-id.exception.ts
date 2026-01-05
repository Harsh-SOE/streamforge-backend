import { DomainException } from '@app/common/exceptions/payload/base';

export interface InvalidViewIdExceptionOptions {
  message?: string;
  meta?: Record<string, any>;
}

export class InvalidViewIdException extends DomainException {
  public constructor(options: InvalidViewIdExceptionOptions) {
    const { message = `Invalid view id was received`, meta } = options || {};
    super({
      code: 'INVALID_INPUT_EXCEPTION',
      message: message,
      meta,
    });
  }
}
