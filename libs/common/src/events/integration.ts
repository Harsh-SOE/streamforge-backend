export interface IntegrationEvent<TPayload> {
  eventName: string;
  eventVersion: number;
  eventId: string;
  occurredAt: string;
  payload: TPayload;
}
