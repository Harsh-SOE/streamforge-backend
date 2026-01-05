import { DomainException } from '@app/common/exceptions/payload/base';

export interface InvalidVisibilityStatusExceptionOptions {
  message?: string;
  meta?: Record<string, any>;
}

export class InvalidVisibilityStatusException extends DomainException {
  public constructor(options: InvalidVisibilityStatusExceptionOptions) {
    const { message = `Invalid visibility status was received`, meta } = options || {};
    super({
      code: 'INVALID_INPUT_EXCEPTION',
      message: message,
      meta,
    });
  }
}
