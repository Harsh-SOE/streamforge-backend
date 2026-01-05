import { DomainException } from '@app/common/exceptions/payload/base';

export interface InvalidVideoFileIdentifierExceptionOptions {
  message?: string;
  meta?: Record<string, any>;
}

export class InvalidVideoFileIndentifierException extends DomainException {
  public constructor(options: InvalidVideoFileIdentifierExceptionOptions) {
    const { message = `Invalid video file identifier was received`, meta } = options || {};
    super({
      code: 'INVALID_INPUT_EXCEPTION',
      message: message,
      meta,
    });
  }
}
