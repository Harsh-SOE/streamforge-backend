import { Injectable, OnModuleInit } from '@nestjs/common';
import LokiTransport from 'winston-loki';
import winston, { createLogger, format, Logger, transport, Logform, transports } from 'winston';

import { LoggerPort } from '@app/ports/logger';

import { AppConfigService } from '@gateway/infrastructure/config';

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

@Injectable()
export class WinstonLoggerAdapter implements OnModuleInit, LoggerPort {
  private logger: Logger;

  public constructor(private readonly configService: AppConfigService) {
    winston.addColors(colors);
  }

  private consoleTransport() {
    const consoleFormatPipeline = format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.colorize(),
      format.printf((info: MyConsoleLogCompleteInfo) => {
        const { level, message, timestamp, stack, ...meta } = info;
        return `[${timestamp}] [${level}] ${message} ${meta ? JSON.stringify(meta) : ''} ${stack || ''}`;
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
      host: this.configService.GRAFANA_LOKI_URL,
      level: 'debug',
      format: lokiFormatPipeline,
    });
  }

  public onModuleInit() {
    const loggerTransports: transport[] = [this.consoleTransport(), this.lokiTransport()];

    this.logger = createLogger({
      levels: levels,
      level: 'debug',
      format: format.combine(format.timestamp(), format.json(), format.errors()),
      transports: loggerTransports,
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
