import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv();

export interface PasteData {
  content: string;
  max_views: number | null;
  current_views: number;
  expires_at: number | null;
}

export function getNow(headers: Headers): number {
  if (process.env.TEST_MODE === '1') {
    const testNow = headers.get('x-test-now-ms');
    if (testNow) return parseInt(testNow, 10);
  }
  return Date.now();
}