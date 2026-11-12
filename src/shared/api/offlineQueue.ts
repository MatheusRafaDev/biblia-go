export interface QueuedRequest {
  id: string;
  type: 'SYNC_PUSH' | 'NOTE_SYNC' | 'FAVORITE_SYNC';
  payload: unknown;
  enqueuedAt: number;
  retryCount: number;
  maxRetries?: number;
}

export interface DrainResult {
  succeeded: number;
  failed: number;
  remaining: number;
}

export class OfflineRequestQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;

  public enqueue(
    type: QueuedRequest['type'],
    payload: unknown,
    maxRetries = 3
  ): QueuedRequest {
    const item: QueuedRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload,
      enqueuedAt: Date.now(),
      retryCount: 0,
      maxRetries,
    };
    this.queue.push(item);
    return item;
  }

  public getQueue(): readonly QueuedRequest[] {
    return [...this.queue];
  }

  public get length(): number {
    return this.queue.length;
  }

  public clear(): void {
    this.queue = [];
  }

  public async drain(
    handler: (item: QueuedRequest) => Promise<boolean>
  ): Promise<DrainResult> {
    if (this.isProcessing) {
      return { succeeded: 0, failed: 0, remaining: this.queue.length };
    }

    this.isProcessing = true;
    let succeeded = 0;
    let failed = 0;
    const nextQueue: QueuedRequest[] = [];

    try {
      for (const item of this.queue) {
        try {
          const success = await handler(item);
          if (success) {
            succeeded++;
          } else {
            item.retryCount++;
            if (item.retryCount < (item.maxRetries ?? 3)) {
              nextQueue.push(item);
            } else {
              failed++; // Abandoned after reaching max retries
            }
          }
        } catch {
          item.retryCount++;
          if (item.retryCount < (item.maxRetries ?? 3)) {
            nextQueue.push(item);
          } else {
            failed++;
          }
        }
      }

      this.queue = nextQueue;
    } finally {
      this.isProcessing = false;
    }

    return {
      succeeded,
      failed,
      remaining: this.queue.length,
    };
  }
}

export const offlineQueue = new OfflineRequestQueue();

