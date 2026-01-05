import { DomainException } from '@app/common/exceptions/payload/base';

export interface InvalidCategoriesExceptionOptions {
  message?: string;
  meta?: Record<string, any>;
}

export class InvalidCategoriesException extends DomainException {
  public constructor(options: InvalidCategoriesExceptionOptions) {
    const { message = `Invalid categories were received`, meta } = options || {};
    super({
      code: 'INVALID_INPUT_EXCEPTION',
      message: message,
      meta,
    });
  }
}
