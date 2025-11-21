// Service Worker for offline capabilities and caching
const CACHE_NAME = 'quran-alhuda-v1';
const STATIC_CACHE = 'quran-alhuda-static-v1';
const API_CACHE = 'quran-alhuda-api-v1';
const QURAN_CACHE = 'quran-alhuda-quran-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error('Failed to cache static assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('quran-alhuda-') && 
                   name !== CACHE_NAME && 
                   name !== STATIC_CACHE && 
                   name !== API_CACHE &&
                   name !== QURAN_CACHE;
          })
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Whitelist of allowed origins for security
  const allowedOrigins = [
    location.origin,
    'https://api.quran.com',
    'https://cdn.islamic.network',
    'https://qurancomplex.gov.sa'
  ];
  
  // Skip requests from non-whitelisted origins
  if (!allowedOrigins.some(origin => url.origin === origin)) {
    return;
  }

  // Quran page images and fonts - cache first with long expiry
  if (
    url.pathname.includes('/quran-dev/images/pages/') ||
    url.pathname.includes('/fonts/UthmanicHafs') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(QURAN_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // API requests - network first, fallback to cache
  if (url.pathname.startsWith('/api/') || url.hostname.includes('qurancomplex.gov.sa')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets - cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Message event - allow clients to skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
