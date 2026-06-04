export interface UploadOptions {
  maxAgeSec?: number;
  metadata?: Record<string, any>;
  contentType?: string;
  resumable?: boolean;
  multipart?: { partSizeBytes?: number; concurrency?: number };
  abortSignal?: AbortSignal;
  timeoutMs?: number;
  retry?: { retries?: number; backoffFactor?: number; minDelayMs?: number };
}
