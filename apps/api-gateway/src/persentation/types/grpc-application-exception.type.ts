import { Metadata, ServiceError } from '@grpc/grpc-js';

export interface ErrorPayload {
  timestamp: string;
  statusCode: string;
  serviceExceptionCode: number;
  httpExceptionCode: number;
  message: string;
  traceId?: string;
  severity?: string;
}

export interface GrpcApplicationErrorType extends ServiceError {
  metadata: Metadata & {
    get(key: 'error-payload'): Array<string>;
  };
}

export function getErrorPayload(err: ServiceError): ErrorPayload {
  const raw = err.metadata.get('error-payload')[0];
  return JSON.parse(raw.toString()) as ErrorPayload;
}
