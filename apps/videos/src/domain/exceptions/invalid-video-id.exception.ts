import { DomainException } from '@app/common/exceptions/payload/base';

export interface InvalidVideoIdExceptionOptions {
  message?: string;
  meta?: Record<string, any>;
}

export class InvalidVideoIdException extends DomainException {
  public constructor(options: InvalidVideoIdExceptionOptions) {
    const { message = `Invalid video id was received`, meta } = options || {};
    super({
      code: 'INVALID_INPUT_EXCEPTION',
      message: message,
      meta,
    });
  }
}
