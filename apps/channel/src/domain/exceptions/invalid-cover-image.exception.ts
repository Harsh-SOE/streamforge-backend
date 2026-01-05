import { DomainException } from '@app/common/exceptions/payload/base';

export interface InvalidCoverImageExceptionOptions {
  message?: string;
  meta?: Record<string, any>;
}

export class InvalidCoverImageException extends DomainException {
  public constructor(options: InvalidCoverImageExceptionOptions) {
    const { message = `Invalid cover image was received`, meta } = options || {};
    super({
      code: 'INVALID_INPUT_EXCEPTION',
      message: message,
      meta,
    });
  }
}
