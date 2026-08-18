/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { platform } from './platform';

export interface PendingRequest {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timestamp: string;
  retryCount: number;
}

export type QueueListener = (queueLength: number) => void;

class OfflineStoreManager {
  private queue: PendingRequest[] = [];
  private listeners: Set<QueueListener> = new Set();
  private readonly QUEUE_KEY = 'nutrimind_write_outbox';
  private isProcessing = false;

  constructor() {
    this.loadQueue();
    platform.onNetworkChange((status) => {
      if (status.connected) {
        this.processQueue();
      }
    });
  }

  /**
   * Safe storage persistence for offline reading (Caching).
   */
  public setItem(key: string, value: any): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`nm_cache_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('[OfflineStore] Cache set failure:', e);
    }
  }

  /**
   * Retrieves offline cached metrics falling back gracefully.
   */
  public getItem<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem(`nm_cache_${key}`);
      return raw ? JSON.parse(raw) as T : fallback;
    } catch (e) {
      return fallback;
    }
  }

  /**
   * Enqueues write requests for background synchronization if the device is offline.
   */
  public async executeWrite(
    url: string, 
    method: 'POST' | 'PUT' | 'DELETE', 
    body?: any, 
    headers?: Record<string, string>
  ): Promise<{ success: boolean; enqueued: boolean; data?: any }> {
    
    // Check if network is available
    if (platform.isOnline()) {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: body ? JSON.stringify(body) : undefined
        });

        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          return { success: true, enqueued: false, data };
        }
      } catch (err) {
        console.warn(`[OfflineStore] Write request to ${url} failed due to network exception. Enqueuing for offline sync.`);
      }
    }

    // Device is offline or server write failed - initiate Outbox Pattern
    const pendingReq: PendingRequest = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      url,
      method,
      headers,
      body,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    this.queue.push(pendingReq);
    this.saveQueue();
    this.notifyListeners();
    platform.triggerHapticFeedback();

    return { success: false, enqueued: true };
  }

  /**
   * Subscribes to transaction queue size modifications.
   */
  public subscribeToQueue(callback: QueueListener): () => void {
    this.listeners.add(callback);
    callback(this.queue.length);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  private loadQueue() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(this.QUEUE_KEY);
      if (raw) {
        this.queue = JSON.parse(raw);
        console.log(`[OfflineStore] Restored ${this.queue.length} pending offline transactions from cache.`);
      }
    } catch (e) {
      console.error('[OfflineStore] Failed to deserialize outbox queue:', e);
    }
  }

  private saveQueue() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.error('[OfflineStore] Failed to save outbox queue to storage:', e);
    }
  }

  private notifyListeners() {
    const len = this.queue.length;
    this.listeners.forEach(callback => {
      try {
        callback(len);
      } catch (err) {
        console.error('[OfflineStore] Subscriber notification exception:', err);
      }
    });
  }

  /**
   * Replays and synchronizes queued transaction outbox once network link layer is established.
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0 || !platform.isOnline()) return;
    this.isProcessing = true;
    console.log(`[OfflineStore] Net established! Syncing ${this.queue.length} transactions sequentially...`);

    const failedIds: string[] = [];

    while (this.queue.length > 0) {
      const request = this.queue[0];
      
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: {
            'Content-Type': 'application/json',
            ...request.headers
          },
          body: request.body ? JSON.stringify(request.body) : undefined
        });

        if (response.ok) {
          // Sync succeeded: remove from queue head
          this.queue.shift();
          this.saveQueue();
          this.notifyListeners();
        } else if (response.status >= 400 && response.status < 500) {
          // Client errors (400, 404, etc.) are unrecoverable; discard to prevent blocking the queue
          console.error(`[OfflineStore] Discarding invalid request to ${request.url} due to client status code: ${response.status}`);
          this.queue.shift();
          this.saveQueue();
          this.notifyListeners();
        } else {
          // Server errors: Back off and retry later
          console.warn(`[OfflineStore] Request to ${request.url} failed with server status ${response.status}. Postponing queue replay.`);
          break;
        }
      } catch (err) {
        console.error(`[OfflineStore] Fetch failure during transaction sync to ${request.url}:`, err);
        request.retryCount++;
        if (request.retryCount >= 5) {
          console.error(`[OfflineStore] Discarding transaction ${request.id} to ${request.url} after 5 failed sync attempts.`);
          this.queue.shift();
        } else {
          // Halt and wait for next connection state trigger
          break;
        }
      }
    }

    this.isProcessing = false;
    console.log('[OfflineStore] Outbox processing completed. Remaining queue length:', this.queue.length);
  }
}

export const offlineStore = new OfflineStoreManager();
