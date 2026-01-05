export interface MessageBusPort {
  publishMessage(topic: string, payload: string): Promise<void>;
}

export const MESSAGE_BROKER = Symbol('MESSAGE_BROKER');
