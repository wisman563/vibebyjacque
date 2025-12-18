const CACHE_NAME = 'vibebyjacque-v2'; // Changed version to force update
const ASSETS_TO_CACHE = [
    './',
    'index.html',
    'splash.html',
    'manifest.json',
    'assets/images/logo.webp',
    'assets/images/banner1.webp',
    'assets/images/banner2.webp',
    'assets/images/banner3.webp',
    'assets/images/banner4.webp',
    'assets/images/banner5.webp',
    'assets/images/service1.webp',
    'assets/images/service2.webp',
    'assets/images/service3.webp',
    'assets/images/service4.webp',
    // Removed service5.webp — it doesn't exist
    // Add more critical assets later if needed
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // Cache files one by one — if one fails, others still cache
                return Promise.allSettled(
                    ASSETS_TO_CACHE.map(url => {
                        return fetch(url, { cache: 'no-cache' })
                            .then(response => {
                                if (response.ok) {
                                    return cache.put(url, response);
                                } else {
                                    console.warn('Failed to fetch (bad response):', url, response.status);
                                }
                            })
                            .catch(err => {
                                console.warn('Failed to fetch:', url, err);
                            });
                    })
                );
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request)
                    .then(networkResponse => {
                        // Cache successful responses (optional runtime caching)
                        if (networkResponse && networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Fallback to cached index.html for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});