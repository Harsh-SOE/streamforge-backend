import { DomainException } from '@app/common/exceptions/payload/base';

export interface InvalidUserIdExceptionOptions {
  message?: string;
  meta?: Record<string, any>;
}

export class InvalidUserIdException extends DomainException {
  public constructor(options: InvalidUserIdExceptionOptions) {
    const { message = `Invalid user id was received`, meta } = options || {};
    super({
      code: 'INVALID_INPUT_EXCEPTION',
      message: message,
      meta,
    });
  }
}
