import { Inject, Injectable } from '@nestjs/common';
import { Consumer, ConsumerConfig, Kafka, Producer, ProducerConfig } from 'kafkajs';

export interface KafkaClientConfig {
  host: string;
  port: number;
  clientId: string;
  caCert: string;
  accessKey: string;
  accessCert: string;
}

export const KAFKA_CLIENT_CONFIG = Symbol('KAFKA_CLIENT_CONFIG');

@Injectable()
export class KafkaClient {
  private client: Kafka;

  public constructor(@Inject(KAFKA_CLIENT_CONFIG) private readonly config: KafkaClientConfig) {
    this.client = new Kafka({
      brokers: [`${this.config.host}:${this.config.port}`],
      clientId: this.config.clientId,
      ssl: {
        rejectUnauthorized: true,
        ca: [this.config.caCert],
        key: this.config.accessKey,
        cert: this.config.accessCert,
      },
    });
  }

  public getProducer(config?: ProducerConfig): Producer {
    return this.client.producer(config);
  }

  public getConsumer(config: ConsumerConfig): Consumer {
    return this.client.consumer(config);
  }

  public getAdmin() {
    return this.client.admin();
  }
}
