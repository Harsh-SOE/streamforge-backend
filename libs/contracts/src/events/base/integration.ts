export interface IntegrationEventMetadata {
  correlationId?: string;
  causationId?: string;
  traceId?: string;
}

export interface IntegrationEvent<TPayload> {
  id: string;
  name: string;
  producer: string;
  cause: string;
  version: number;
  publishedAt: string;
  payload: TPayload;
  metadata?: IntegrationEventMetadata;
}
