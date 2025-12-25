import LokiTransport from 'winston-loki';
import { Inject, Injectable } from '@nestjs/common';
import winston, { createLogger, format, Logger, transport, Logform, transports } from 'winston';

import { LoggerPort } from '@app/ports/logger';

const levels = {
  fatal: 0,
  error: 1,
  alert: 2,
  warn: 3,
  info: 4,
  debug: 5,
};

const colors = {
  fatal: 'bgRed white bold',
  error: 'red bold',
  alert: 'yellow bold',
  warn: 'yellow',
  info: 'cyan',
  debug: 'gray',
};

export interface MyConsoleLogCompleteInfo extends Logform.TransformableInfo {
  message: string;
  timestamp: string;
  stack?: string;
  [key: string]: any;
}

export const LOKI_URL = Symbol('LOKI_URL');

@Injectable()
export class LokiConsoleLogger implements LoggerPort {
  private logger: Logger;

  public constructor(@Inject(LOKI_URL) private readonly url: string) {
    winston.addColors(colors);
    const loggerTransports: transport[] = [this.consoleTransport(), this.lokiTransport()];

    this.logger = createLogger({
      levels: levels,
      level: 'debug',
      format: format.combine(format.timestamp(), format.json(), format.errors()),
      transports: loggerTransports,
    });
  }

  private consoleTransport() {
    const consoleFormatPipeline = format.combine(
      format.timestamp({ format: 'MM/DD/YYYY, h:mm:ss A' }),
      format.errors({ stack: true }),
      format.colorize({ all: true }),
      format.printf((info: MyConsoleLogCompleteInfo) => {
        const { level, message, timestamp, stack, ...meta } = info;
        const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `[${timestamp}] [${level}] ${message} ${metaString} ${stack || ''}`;
      }),
    );

    return new transports.Console({
      level: 'debug',
      format: consoleFormatPipeline,
    });
  }

  private lokiTransport() {
    const lokiFormatPipeline = format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.json({ maximumDepth: 3 }),
    );
    return new LokiTransport({
      host: this.url,
      level: 'debug',
      format: lokiFormatPipeline,
    });
  }

  public info(message: string, ...meta: Record<string, any>[]): void {
    this.logger.log('info', message, ...meta);
  }

  public error(message: string, ...meta: Record<string, any>[]): void {
    this.logger.log('error', message, meta);
  }

  public alert(message: string, ...meta: Record<string, any>[]): void {
    this.logger.log('alert', message, meta);
  }

  public fatal(message: string, ...meta: Record<string, any>[]): void {
    this.logger.log('fatal', message, meta);
  }
}
