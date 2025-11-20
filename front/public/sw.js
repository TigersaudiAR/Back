// Service Worker for offline capabilities and caching
const CACHE_NAME = 'quran-alhuda-v2';
const STATIC_CACHE = 'quran-alhuda-static-v2';
const API_CACHE = 'quran-alhuda-api-v2';
const IMAGES_CACHE = 'quran-alhuda-images-v1';
const FONTS_CACHE = 'quran-alhuda-fonts-v1';

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
                   name !== IMAGES_CACHE &&
                   name !== FONTS_CACHE;
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
  if (!allowedOrigins.some(origin => url.origin === origin || url.origin.startsWith(origin))) {
    return;
  }

  // Quran page images - cache first with long expiry
  if (url.pathname.includes('/images/pages/') || url.pathname.includes('page') && url.pathname.match(/\.(png|jpg|jpeg|webp)$/i)) {
    event.respondWith(
      caches.open(IMAGES_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // Font files - cache first with long expiry
  if (url.pathname.match(/\.(woff2|woff|ttf|otf)$/i)) {
    event.respondWith(
      caches.open(FONTS_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // API requests - network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
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
