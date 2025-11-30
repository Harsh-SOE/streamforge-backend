export interface LoggerPort {
  info(message: string, meta?: Record<string, any>): void;

  error(message: string, meta?: Record<string, any>): void;

  alert(message: string, meta?: Record<string, any>): void;

  fatal(message: string, meta?: Record<string, any>): void;
}

export const LOGGER_PORT = Symbol('LOGGER_PORT');
