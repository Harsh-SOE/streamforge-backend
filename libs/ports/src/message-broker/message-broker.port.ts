export interface MessageBrokerPort {
  publishMessage(topic: string, payload: string): Promise<void>;

  subscribeTo(topic: string): Promise<void>;
}

export const MESSAGE_BROKER = Symbol('MESSAGE_BROKER');
