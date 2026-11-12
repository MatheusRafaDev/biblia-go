import { describe, it, expect, beforeEach } from 'vitest';
import { OfflineRequestQueue } from '../../src/shared/api/offlineQueue';

describe('OfflineRequestQueue', () => {
  let queue: OfflineRequestQueue;

  beforeEach(() => {
    queue = new OfflineRequestQueue();
  });

  it('enqueues items and reports accurate length', () => {
    expect(queue.length).toBe(0);

    const item = queue.enqueue('SYNC_PUSH', { version: 1 });
    expect(queue.length).toBe(1);
    expect(item.type).toBe('SYNC_PUSH');
    expect(item.retryCount).toBe(0);
  });

  it('successfully drains queue when handler resolves true', async () => {
    queue.enqueue('SYNC_PUSH', { id: 1 });
    queue.enqueue('NOTE_SYNC', { id: 2 });

    const processed: string[] = [];
    const result = await queue.drain(async (item) => {
      processed.push(item.id);
      return true;
    });

    expect(result.succeeded).toBe(2);
    expect(result.failed).toBe(0);
    expect(result.remaining).toBe(0);
    expect(queue.length).toBe(0);
    expect(processed.length).toBe(2);
  });

  it('retries items that fail until maxRetries is reached', async () => {
    queue.enqueue('SYNC_PUSH', { fail: true }, 2);

    // Attempt 1: fails, kept in queue with retryCount=1
    const result1 = await queue.drain(async () => false);
    expect(result1.succeeded).toBe(0);
    expect(result1.failed).toBe(0);
    expect(result1.remaining).toBe(1);
    expect(queue.length).toBe(1);

    // Attempt 2: fails, exceeds maxRetries (2), discarded
    const result2 = await queue.drain(async () => false);
    expect(result2.succeeded).toBe(0);
    expect(result2.failed).toBe(1);
    expect(result2.remaining).toBe(0);
    expect(queue.length).toBe(0);
  });

  it('can be cleared manually', () => {
    queue.enqueue('SYNC_PUSH', {});
    queue.enqueue('NOTE_SYNC', {});
    expect(queue.length).toBe(2);

    queue.clear();
    expect(queue.length).toBe(0);
  });
});
