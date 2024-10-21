const CACHE_NAME = 'external-site-cache-v1';
const EXTERNAL_URL = 'https://maxgames.pages.dev/c'; // Replace with the target website
const MOUNT_PATH = '/games'; // The path where you want to mount the external site

// Install event - caching resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Opened cache');
            // You can pre-cache specific resources here if needed
            return cache.addAll([/* Add resources to pre-cache if necessary */]);
        })
    );
});

// Fetch event - serving resources from the external site
self.addEventListener('fetch', event => {
    if (event.request.url.startsWith(location.origin + MOUNT_PATH)) {
        // Modify the request URL to point to the external site
        const externalUrl = event.request.url.replace(location.origin + MOUNT_PATH, EXTERNAL_URL);
        
        event.respondWith(
            caches.match(event.request).then(response => {
                // Cache hit - return the response from the cached version
                if (response) {
                    return response;
                }
                // Cache miss - fetch the resource from the external site
                return fetch(externalUrl).then(networkResponse => {
                    // Cache the new response
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    } else {
        // For other requests, proceed as normal (or handle them differently)
        event.respondWith(fetch(event.request));
    }
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});