const CACHE_NAME = 'nampod-cache-v1';

const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
];

// install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
});

// activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

// fetch: 音声・フォントは絶対キャッシュ優先
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.pathname.includes('/audio/') || url.pathname.includes('/fonts/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;

        return fetch(event.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return res;
        });
      })
    );
    return;
  }
});
