export interface CachSetResult {
  result: 'SET' | 'NOT SET';
  key: string;
  value: string;
}
