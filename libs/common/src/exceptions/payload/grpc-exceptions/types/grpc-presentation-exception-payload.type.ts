export interface GrpcExceptionPayload {
  timestamp: string;
  statusCode: string;
  serviceExceptionCode: number;
  httpExceptionCode: number;
  message: string;
  traceId?: string;
  severity?: string;
}
