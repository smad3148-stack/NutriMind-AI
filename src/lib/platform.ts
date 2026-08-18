/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlatformType = 'web' | 'android' | 'ios' | 'desktop' | 'pwa';

export interface NetworkStatus {
  connected: boolean;
  connectionType?: 'wifi' | 'cellular' | 'ethernet' | 'none' | 'unknown';
}

export type NetworkListener = (status: NetworkStatus) => void;

class PlatformBridge {
  private listeners: Set<NetworkListener> = new Set();
  private isOnlineStatus = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.updateNetworkStatus(true));
      window.addEventListener('offline', () => this.updateNetworkStatus(false));
    }
  }

  /**
   * Identifies the precise runtime host container.
   */
  public getPlatform(): PlatformType {
    if (typeof window === 'undefined') return 'web';

    // 1. Check for Tauri Desktop environment
    if ((window as any).__TAURI_METADATA__ || (window as any).__TAURI__) {
      return 'desktop';
    }

    // 2. Check for Capacitor Mobile bridge
    if ((window as any).Capacitor) {
      const platform = (window as any).Capacitor.getPlatform();
      if (platform === 'ios') return 'ios';
      if (platform === 'android') return 'android';
    }

    // 3. Detect standalone PWA running state
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (navigator as any).standalone === true;
    if (isStandalone) {
      return 'pwa';
    }

    // 4. Fallback to Web client
    return 'web';
  }

  /**
   * Returns human-readable platform description.
   */
  public getPlatformLabel(): string {
    const platform = this.getPlatform();
    switch (platform) {
      case 'android': return 'Android App (Capacitor)';
      case 'ios': return 'iOS App (Capacitor)';
      case 'desktop': return 'Desktop Client (Tauri)';
      case 'pwa': return 'Progressive Web App';
      default: return 'Modern Web App';
    }
  }

  /**
   * Simple state check of network link layer.
   */
  public isOnline(): boolean {
    return this.isOnlineStatus;
  }

  /**
   * Subscribe to network link mutations.
   */
  public onNetworkChange(callback: NetworkListener): () => void {
    this.listeners.add(callback);
    // Immediately emit current state
    callback({ connected: this.isOnlineStatus });

    return () => {
      this.listeners.delete(callback);
    };
  }

  private updateNetworkStatus(online: boolean) {
    this.isOnlineStatus = online;
    const status: NetworkStatus = { connected: online };
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (err) {
        console.error('Error invoking network change subscriber:', err);
      }
    });
  }

  /**
   * Registers PWA Service Worker for standard web browsers and standalone installs.
   */
  public registerServiceWorker(): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Skip SW registration inside native application containers
    if (this.getPlatform() === 'android' || this.getPlatform() === 'ios') {
      console.log('[Platform] Native container detected. Skipping service worker registration.');
      return;
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((reg) => {
          console.log('[Service Worker] Registered successfully with scope:', reg.scope);
          
          // Background Sync Registration fully safe for sandboxed/iframe environments
          try {
            if (reg && 'sync' in reg && (reg as any).sync && typeof (reg as any).sync.register === 'function') {
              (reg as any).sync.register('sync-metabolic-queue')
                .then(() => console.log('[Sync] Background sync registered successfully.'))
                .catch((err: any) => console.log('[Sync] Background sync registration bypassed (expected sandbox fallback):', err?.message || err));
            } else {
              console.log('[Sync] Background sync API not supported or disabled in this environment.');
            }
          } catch (syncErr: any) {
            console.log('[Sync] Background sync initialization bypassed (expected sandbox fallback):', syncErr?.message || syncErr);
          }
        })
        .catch((err) => {
          console.log('[Service Worker] Registration bypassed (expected sandbox fallback):', err?.message || err);
        });
    });
  }

  /**
   * Decodes, processes, and dispatches custom URI schemes and universal deep links.
   */
  public handleDeepLink(urlStr: string, callback: (route: string, params: Record<string, string>) => void): void {
    try {
      const url = new URL(urlStr);
      // e.g. nutrimind://app/metabolic-coach?userId=123
      const route = url.pathname || '/';
      const params: Record<string, string> = {};
      url.searchParams.forEach((val, key) => {
        params[key] = val;
      });
      console.log('[DeepLink] Parsed routing path:', route, 'with parameters:', params);
      callback(route, params);
    } catch (e) {
      console.error('[DeepLink] Parsing exception for string:', urlStr);
    }
  }

  /**
   * Native device feedback bridge.
   */
  public triggerHapticFeedback(): void {
    const platform = this.getPlatform();
    if (platform === 'ios' || platform === 'android') {
      const cap = (window as any).Capacitor;
      if (cap?.Plugins?.Haptics) {
        cap.Plugins.Haptics.vibrate();
      }
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
  }
}

export const platform = new PlatformBridge();
