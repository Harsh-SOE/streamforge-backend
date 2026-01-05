import { DomainException } from '@app/common/exceptions/payload/base';

export interface InvalidIdExceptionOptions {
  message?: string;
  meta?: Record<string, any>;
}

export class InvalidIdException extends DomainException {
  public constructor(options: InvalidIdExceptionOptions) {
    const { message = `Invalid id was received`, meta } = options || {};
    super({
      code: 'INVALID_INPUT_EXCEPTION',
      message: message,
      meta,
    });
  }
}
