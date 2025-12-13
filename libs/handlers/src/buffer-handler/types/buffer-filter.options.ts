export interface BasicBufferOptions {
  logErrors: boolean;
  host?: string;
  port?: number;
}

interface BufferSupressedErrorOptions<TFallback> extends BasicBufferOptions {
  suppressErrors: true;
  fallbackValue: TFallback;
}

interface BufferNoErrorOptions extends BasicBufferOptions {
  suppressErrors: false;
  fallbackValue?: never;
}

type BufferBasicFilterOptions<TFallback = never> =
  | BufferSupressedErrorOptions<TFallback>
  | BufferNoErrorOptions;

interface BufferFlushOperationOptions extends BasicBufferOptions {
  operationType: 'FLUSH';
  valueToBuffer?: never;
}

interface BufferSaveOperationOptions extends BasicBufferOptions {
  operationType: 'SAVE';
  valueToBuffer: string;
}

type BufferOperationOptions = BufferFlushOperationOptions | BufferSaveOperationOptions;

export type BufferFilterOptions<TFallback = never> = BufferBasicFilterOptions<TFallback> &
  BufferOperationOptions;
