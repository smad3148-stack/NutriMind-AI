/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { platform } from './platform';

export interface CrashReport {
  id: string;
  message: string;
  stack?: string;
  url: string;
  line?: number;
  column?: number;
  breadcrumbs: string[];
  metadata: {
    userAgent: string;
    platform: string;
    viewport: string;
    timestamp: string;
    isOnline: boolean;
  };
}

class CrashReporter {
  private breadcrumbs: string[] = [];
  private maxBreadcrumbs = 25;
  private readonly STORAGE_KEY = 'nutrimind_crash_logs';

  constructor() {
    this.addBreadcrumb('System initialized');
    this.setupListeners();
    this.syncSavedCrashes();
    platform.onNetworkChange((status) => {
      if (status.connected) {
        this.syncSavedCrashes();
      }
    });
  }

  /**
   * Appends a high-level user action or state change to trace replication leading up to errors.
   */
  public addBreadcrumb(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.breadcrumbs.push(`[${timestamp}] ${message}`);
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  /**
   * Capture and transmit an explicit error trace manually.
   */
  public captureException(error: Error, additionalMeta?: Record<string, any>): void {
    const msg = (error?.message || String(error) || '').toLowerCase();
    const stackStr = (error?.stack || '').toLowerCase();
    const metaStr = JSON.stringify(additionalMeta || '').toLowerCase();
    
    // Ignore benign HMR, WebSocket, and Vite-related development environment rejections/errors
    if (
      msg === 'event' ||
      msg === '[object event]' ||
      msg.includes('websocket') ||
      msg.includes('vite') ||
      msg.includes('hmr') ||
      msg.includes('ws:') ||
      msg.includes('wss:') ||
      msg.includes('failed to connect') ||
      msg.includes('closed without opened') ||
      msg.includes('connection refused') ||
      msg.includes('networkerror') ||
      stackStr.includes('websocket') ||
      stackStr.includes('vite') ||
      stackStr.includes('hmr') ||
      stackStr.includes('@vite/client') ||
      metaStr.includes('websocket') ||
      metaStr.includes('vite') ||
      metaStr.includes('hmr') ||
      metaStr.includes('@vite/client')
    ) {
      return;
    }

    const report: CrashReport = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      message: error.message || String(error),
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      breadcrumbs: [...this.breadcrumbs],
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        platform: platform.getPlatformLabel(),
        viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '0x0',
        timestamp: new Date().toISOString(),
        isOnline: platform.isOnline(),
        ...additionalMeta
      }
    };

    console.error('[CrashReporter] Intercepted Exception:', report);

    if (platform.isOnline()) {
      this.sendCrashReport(report);
    } else {
      this.saveCrashOffline(report);
    }
  }

  private setupListeners() {
    if (typeof window === 'undefined') return;

    // Listen to uncaught exceptions
    window.onerror = (message, url, line, col, error) => {
      const parsedError = error || new Error(String(message));
      this.captureException(parsedError, {
        rawUrl: url,
        line,
        col
      });
      // Do not suppress native console reporting
      return false;
    };

    // Listen to unhandled promise rejections
    window.onunhandledrejection = (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      this.captureException(error, {
        rejectionReason: 'unhandled_promise_rejection'
      });
    };
  }

  private async sendCrashReport(report: CrashReport): Promise<boolean> {
    try {
      const res = await fetch('/api/diagnostics/crash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  private saveCrashOffline(report: CrashReport) {
    try {
      const existing = this.getSavedCrashes();
      existing.push(report);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing));
      console.log('[CrashReporter] Saved crash dump to local storage buffer.');
    } catch (e) {
      console.error('[CrashReporter] Failed to backup crash dump offline:', e);
    }
  }

  private getSavedCrashes(): CrashReport[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Flushes and synchronizes stored crash logs when connectivity recovers.
   */
  private async syncSavedCrashes(): Promise<void> {
    const crashes = this.getSavedCrashes();
    if (crashes.length === 0 || !platform.isOnline()) return;

    console.log(`[CrashReporter] Found ${crashes.length} un-uploaded crash logs. Dispatching to diagnostics server...`);
    const successfulIds: string[] = [];

    for (const report of crashes) {
      const ok = await this.sendCrashReport(report);
      if (ok) {
        successfulIds.push(report.id);
      }
    }

    if (successfulIds.length > 0) {
      const remaining = crashes.filter(c => !successfulIds.includes(c.id));
      if (remaining.length > 0) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(remaining));
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
      console.log(`[CrashReporter] Successfully synchronized ${successfulIds.length} crash records.`);
    }
  }
}

export const crashReporter = new CrashReporter();
