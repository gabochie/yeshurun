const CACHE_NAME = 'yeshurun-preview-v10';
const ASSETS = [
  './index.html',
  './preview.html',
  './manifest.json',
  './cover.jpg',
  './covers/cover-1.jpg',
  './covers/cover-2.jpg',
  './covers/cover-2a.jpg',
  './covers/cover-3.jpg',
  './fonts/fonts.css',
  './fonts/spacegrotesk-var.woff2',
  './fonts/poppins-400.woff2',
  './fonts/poppins-600.woff2',
  './fonts/poppins-700.woff2',
  './fonts/poppins-800.woff2',
  './fonts/poppins-900.woff2',
  './fonts/poppins-italic-400.woff2',
  './icon-192.png',
  './icon-512.png',
  './maskable-512.png',
  './apple-touch-icon.png',
  './icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : null)))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.includes('/.netlify/')) return;

  // Pages: network-first so deployed updates always win when online
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(()=>{});
        return res;
      }).catch(() =>
        caches.match(event.request).then((c) => c || caches.match('./index.html'))
      )
    );
    return;
  }

  // Assets: cache-first for speed
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(()=>{});
        return res;
      }).catch(() => cached);
    })
  );
});
