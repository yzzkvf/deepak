const CACHE_NAME = 'deepak-portfolio-v1.1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/index-production.html',
    '/styles.min.css',
    '/scripts.min.js',
    '/resources/profile-pic-optimized.webp',
    '/resources/profile-pic-optimized.jpg',
    '/resources/deepak_resume.pdf'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
            .catch(() => {
                // If both cache and network fail, return a fallback
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Background sync for analytics or other tasks
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Perform background tasks
            console.log('Background sync triggered')
        );
    }
});

// Push notifications (if needed in future)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New update available',
        icon: '/resources/profile-pic-optimized.webp',
        badge: '/resources/profile-pic-optimized.webp'
    };

    event.waitUntil(
        self.registration.showNotification('Portfolio Update', options)
    );
});