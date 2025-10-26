// Enhanced Service Worker for Tap Empire Infinity PWA
// Version 2.0 - With automatic update system

const VERSION = '2.0';
const CACHE_NAME = 'tap-empire-v2'; // INCREMENT THIS WITH EACH UPDATE
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install event - cache assets immediately
self.addEventListener('install', (event) => {
  console.log(`[SW v${VERSION}] Installing...`);

  // Skip waiting to activate new service worker immediately
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`[SW v${VERSION}] Opened cache`);
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error(`[SW v${VERSION}] Cache failed:`, error);
      })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log(`[SW v${VERSION}] Activating...`);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete any cache that doesn't match current version
          if (cacheName !== CACHE_NAME) {
            console.log(`[SW v${VERSION}] Deleting old cache:`, cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return cached response
        if (response) {
          // For HTML files, check for updates in background
          if (event.request.url.includes('.html') || event.request.url.endsWith('/')) {
            // Fetch fresh version in background
            fetch(event.request).then((freshResponse) => {
              if (freshResponse && freshResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, freshResponse);
                });
              }
            }).catch(() => {
              // Network failed, keep using cache
            });
          }
          return response;
        }

        // Not in cache - fetch from network
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Add to cache for future use
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // If both cache and network fail, return offline message
        return new Response('Offline - Please check your connection', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      })
  );
});

// Listen for skip waiting message from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log(`[SW v${VERSION}] Received SKIP_WAITING message`);
    self.skipWaiting();
  }
});

// Background sync for game state (optional enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-game-state') {
    event.waitUntil(syncGameState());
  }
});

function syncGameState() {
  // Placeholder for future online sync features
  return Promise.resolve();
}

// Push notification support (for future updates)
self.addEventListener('push', (event) => {
  const title = 'Tap Empire Infinity';
  const options = {
    body: event.data ? event.data.text() : 'New rewards available!',
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log(`[SW v${VERSION}] Notification click received`);
  event.notification.close();

  event.waitUntil(
    clients.openWindow('./')
  );
});

console.log(`[SW v${VERSION}] Service Worker loaded successfully`);
