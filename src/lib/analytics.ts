/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { platform } from './platform';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: string;
}

class AnalyticsManager {
  private offlineQueue: AnalyticsEvent[] = [];
  private readonly QUEUE_KEY = 'nutrimind_analytics_queue';
  private batchSize = 10;
  private syncInProgress = false;

  constructor() {
    this.loadOfflineQueue();
    // Listen to network transitions to trigger outbox replay
    platform.onNetworkChange((status) => {
      if (status.connected) {
        this.flushQueue();
      }
    });
  }

  /**
   * Tracks standard user interactions and system milestones.
   */
  public trackEvent(name: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name,
      properties: {
        ...properties,
        platform: platform.getPlatformLabel(),
        screen_width: typeof window !== 'undefined' ? window.innerWidth : 0,
        screen_height: typeof window !== 'undefined' ? window.innerHeight : 0,
      },
      timestamp: new Date().toISOString()
    };

    console.log(`[Analytics] Tracked: "${name}"`, event.properties);

    if (platform.isOnline()) {
      this.sendToDiagnosticsProvider(event);
    } else {
      console.log(`[Analytics] Offline detected. Queuing event "${name}" in dynamic outbox.`);
      this.offlineQueue.push(event);
      this.saveOfflineQueue();
    }
  }

  /**
   * Tracks screen transition diagnostics.
   */
  public trackScreen(screenName: string, componentName?: string): void {
    this.trackEvent('screen_view', {
      screen_name: screenName,
      component_name: componentName || screenName
    });
  }

  /**
   * Identifies the current active user for demographic segmentation.
   */
  public identifyUser(userId: string, traits?: Record<string, any>): void {
    console.log(`[Analytics] Identified user: ${userId}`, traits);
    // Real implementation would bind Sentry, Segment, Mixpanel, or Google Firebase user profiles
    if (typeof window !== 'undefined') {
      (window as any)._nutrimind_user_id = userId;
      (window as any)._nutrimind_user_traits = traits;
    }
  }

  private loadOfflineQueue() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(this.QUEUE_KEY);
      if (raw) {
        this.offlineQueue = JSON.parse(raw);
        console.log(`[Analytics] Loaded ${this.offlineQueue.length} unsynced analytics from storage.`);
      }
    } catch (e) {
      console.error('[Analytics] Failed to deserialize diagnostics outbox:', e);
    }
  }

  private saveOfflineQueue() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.offlineQueue));
    } catch (e) {
      console.error('[Analytics] Failed to save diagnostics outbox to storage:', e);
    }
  }

  /**
   * Forwards a diagnostics pack to backend collection nodes.
   */
  private async sendToDiagnosticsProvider(event: AnalyticsEvent): Promise<boolean> {
    try {
      // Real enterprise integration to server-side diagnostics collector
      const response = await fetch('/api/diagnostics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: [event] })
      });
      return response.ok;
    } catch (e) {
      // If endpoint returns error or fails connection, return false to re-queue
      return false;
    }
  }

  /**
   * Synchronizes accumulated offline tracking records when network becomes available.
   */
  private async flushQueue(): Promise<void> {
    if (this.syncInProgress || this.offlineQueue.length === 0) return;
    this.syncInProgress = true;
    console.log(`[Analytics] Synchronizing ${this.offlineQueue.length} queued records to cloud servers...`);

    try {
      while (this.offlineQueue.length > 0) {
        const batch = this.offlineQueue.slice(0, this.batchSize);
        
        // Push batch to production analytics endpoint
        const response = await fetch('/api/diagnostics/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: batch })
        });

        if (response.ok) {
          // Success: pop batch from memory queue
          this.offlineQueue = this.offlineQueue.slice(batch.length);
          this.saveOfflineQueue();
        } else {
          // Failure (e.g. rate limit, bad payload): Backoff and try again later
          console.warn('[Analytics] Outbox synchronization failed. Retrying on next connection window.');
          break;
        }
      }
    } catch (err) {
      console.error('[Analytics] Outbox sync error during fetch transport:', err);
    } finally {
      this.syncInProgress = false;
    }
  }
}

export const analytics = new AnalyticsManager();
