import { DomainException } from '@app/common/exceptions/payload/base';

export interface InvalidBioExceptionOptions {
  message?: string;
  meta?: Record<string, any>;
}

export class InvalidBioException extends DomainException {
  public constructor(options: InvalidBioExceptionOptions) {
    const { message = `Invalid bio was received`, meta } = options || {};
    super({
      code: 'INVALID_INPUT_EXCEPTION',
      message: message,
      meta,
    });
  }
}
