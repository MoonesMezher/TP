const SITE_STATIC_CACHE_NAME = "pwa-cache-v2";

const assets = [
    "/",
    "/index.html",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
    "/index.css",
    "/app.js",
    "manifest.json"
]


self.addEventListener("install", event => {
    // save in the cache
    event.waitUntil(
        caches.open(SITE_STATIC_CACHE_NAME).then(cache => {
            return cache.addAll(assets);
        })
    );
});

self.addEventListener("activate", event => {
    // delete all caches without the actual one
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== SITE_STATIC_CACHE_NAME )
                .map(key => caches.delete(key))
            );
        })
    );
})

self.addEventListener("fetch", event => {
    // implement offline mode
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request)
            })
    );
    /* console.log("service worker has been fetched", event); */
});
