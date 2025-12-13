export type DomainExceptionOptions = {
  message: string;
  code: string;
  traceId?: string;
  meta?: Record<string, any>;
};

export class DomainException extends Error {
  public readonly timestamp: Date;
  public readonly code: string;
  public readonly traceId?: string;
  public readonly meta?: Record<string, any>;

  public constructor(options: DomainExceptionOptions) {
    const { message = `Something went wrong`, code = 'ERROR', traceId, meta } = options || {};
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.timestamp = new Date();
    this.traceId = traceId;
    this.meta = meta;

    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON() {
    return {
      timestamp: this.timestamp,
      name: this.name,
      code: this.code,
      message: this.message,
      traceId: this.traceId,
      meta: this.meta,
    };
  }
}
