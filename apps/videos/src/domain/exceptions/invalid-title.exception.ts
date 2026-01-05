import { DomainException } from '@app/common/exceptions/payload/base';

export interface InvalidTitleExceptionOptions {
  message?: string;
  meta?: Record<string, any>;
}

export class InvalidTitleException extends DomainException {
  public constructor(options: InvalidTitleExceptionOptions) {
    const { message = `Invalid title was received`, meta } = options || {};
    super({
      code: 'INVALID_INPUT_EXCEPTION',
      message: message,
      meta,
    });
  }
}
