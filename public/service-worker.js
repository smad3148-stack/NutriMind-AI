/**
 * NutriMind AI Enterprise Service Worker
 * Implements high-performance offline shell caching, network-fallback-to-cache strategy,
 * outbox synchronization hooks, and push notifications event listeners.
 */

// Versioned cache name: bump on every change so the activate handler evicts
// caches from older deployments instead of serving stale bundles.
const CACHE_NAME = 'nutrimind-v2-cache';
const PRE_CACHE_ASSETS = [
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

// Install Event: Pre-cache Static Assets. Each asset is cached individually
// so a single missing file cannot abort the whole installation.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline shell...');
      return Promise.allSettled(PRE_CACHE_ASSETS.map((asset) => cache.add(asset)));
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Cleanup Stale Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Evicting stale cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Cache Interceptor with Network Fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass service worker cache for API requests, live telemetry, and Supabase / Google endpoints
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase') || url.hostname.includes('google')) {
    return;
  }

  // HTML navigations are network-first: serving a cached index.html whose
  // hashed asset chunks no longer exist on the server is a classic white
  // screen after redeploys. Fall back to the cached shell only when offline.
  const acceptHeader = request.headers.get('accept') || '';
  if (request.mode === 'navigate' || acceptHeader.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // Handle static assets: cache-first with background revalidation
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache but update cache in the background (stale-while-revalidate)
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse);
            });
          }
        }).catch(() => {/* Silent catch in offline state */});
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});

// Background Sync Listener (e.g. for syncing offline metabolic meal tracking)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-metabolic-queue') {
    console.log('[Service Worker] Network back online! Replaying queued offline biometric writes...');
    event.waitUntil(triggerOfflineSync());
  }
});

// Sync triggers message to client context
async function triggerOfflineSync() {
  const allClients = await self.clients.matchAll();
  for (const client of allClients) {
    client.postMessage({ type: 'OFFLINE_SYNC_TRIGGER' });
  }
}

// Push Notification Event
self.addEventListener('push', (event) => {
  let data = { title: 'NutriMind Core', body: 'New biometrics insights available.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'NutriMind Core', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/assets/icon-192.png',
    badge: '/assets/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open_dashboard', title: 'Open Dashboard' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Or open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
