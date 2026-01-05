import { DomainException } from '@app/common/exceptions/payload/base';

export interface InvalidDescriptionExceptionOptions {
  message?: string;
  meta?: Record<string, any>;
}

export class InvalidDescriptionException extends DomainException {
  public constructor(options: InvalidDescriptionExceptionOptions) {
    const { message = `Invalid description was received`, meta } = options || {};
    super({
      code: 'INVALID_INPUT_EXCEPTION',
      message: message,
      meta,
    });
  }
}
