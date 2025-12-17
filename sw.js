const CACHE_NAME = 'vibebyjacque-v1';
const ASSETS_TO_CACHE = [
    './',
    'index.html',
    'manifest.json',
    'assets/images/logo.webp',
    'assets/images/banner1.webp',
    'assets/images/banner2.webp',
    'assets/images/banner3.webp',
    'assets/images/banner4.webp',
    'assets/images/banner5.webp',
    // Add more critical assets if you want (images, fonts, etc.)
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
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
                return cachedResponse || fetch(event.request)
                    .then(networkResponse => {
                        // Optional: cache new responses
                        return caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        });
                    })
                    .catch(() => {
                        // Optional: show offline fallback page
                        return caches.match('./index.html');
                    });
            })
    );
});