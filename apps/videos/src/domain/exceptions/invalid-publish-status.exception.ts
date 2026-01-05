import { DomainException } from '@app/common/exceptions/payload/base';

export interface InvalidPublishStatusExceptionOptions {
  message?: string;
  meta?: Record<string, any>;
}

export class InvalidPublishStatusException extends DomainException {
  public constructor(options: InvalidPublishStatusExceptionOptions) {
    const { message = `Invalid publish status was received`, meta } = options || {};
    super({
      code: 'INVALID_INPUT_EXCEPTION',
      message: message,
      meta,
    });
  }
}
