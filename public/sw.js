const CACHE_VERSION = 'clock-v2';
const CACHE_NAME = `cache-${CACHE_VERSION}`;

const REQUIRED_PRECACHE = [
  '/analog-clock/',
  '/analog-clock/index.html',
  '/analog-clock/manifest.webmanifest',
];

const OPTIONAL_PRECACHE = [
  '/analog-clock/icons/icon-192.png',
  '/analog-clock/icons/icon-512.png',
  '/analog-clock/icons/maskable-192.png',
  '/analog-clock/icons/maskable-512.png',
  '/analog-clock/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(REQUIRED_PRECACHE);
      await Promise.all(
        OPTIONAL_PRECACHE.map(async (url) => {
          try {
            await cache.add(url);
          } catch (_err) {
            // Ignore non-critical icon precache failures.
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key.startsWith('cache-clock-') && key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return undefined;
        })
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          }
          return response;
        } catch (_err) {
          const cached = await caches.match('/analog-clock/index.html');
          if (cached) {
            return cached;
          }
          throw _err;
        }
      })()
    );
    return;
  }

  // Cache-first for other same-origin GET requests.
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) {
        return cached;
      }

      try {
        const response = await fetch(request);
        if (response && response.ok && response.type === 'basic') {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (_err) {
        return Response.error();
      }
    })()
  );
});
