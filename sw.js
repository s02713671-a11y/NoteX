const CACHE_NAME = "notex-v1.4";


const FILES_TO_CACHE = [
    "/",
    "/static/style.css",
    "/static/app.js",
    "/static/manifest.json",
    "/static/icons/icon-192.png",
    "/static/icons/icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );

    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {

            if (cachedResponse) {
                return cachedResponse;
            }

            // Ignore missing favicon request
            if (event.request.url.endsWith("/favicon.ico")) {
                return new Response("", {
                    status: 204,
                    statusText: "No Content"
                });
            }

            return fetch(event.request).catch(() => {
                return caches.match("/");
            });
        })
    );
});