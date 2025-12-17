// sw.js - Minimal service worker to make the site installable
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
    // Required fetch handler (can be empty or simple)
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});