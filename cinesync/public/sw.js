/* ============================================================
   CineSync · Service Worker
   ------------------------------------------------------------
   Makes CineSync installable + fast to open, WITHOUT breaking
   real-time features.

   Strategy:
     - App shell (HTML/CSS/JS/icons/manifest) -> cache-first,
       refreshed in the background (stale-while-revalidate).
     - Navigations -> network-first, fall back to cached shell
       when offline (so the icon still opens something nice).
     - Everything else (Socket.IO, YouTube, Google Drive, uploads,
       video streams, APIs) -> NEVER cached, always go to network.
   ============================================================ */

const VERSION = 'cinesync-v1';
const SHELL_CACHE = `${VERSION}-shell`;

// Core files that make up the installable "app".
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/player.js',
  '/js/chat.js',
  '/js/pwa.js',
  '/manifest.webmanifest',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/icon-maskable-192.png',
  '/assets/icon-maskable-512.png',
  '/assets/apple-touch-icon.png',
];

// Requests we must always pass straight through to the network.
function isBypassed(url, request) {
  // Only handle same-origin GET requests in the cache layer.
  if (request.method !== 'GET') return true;
  if (url.origin !== self.location.origin) return true; // YouTube, Drive, fonts, CDNs
  if (url.pathname.startsWith('/socket.io/')) return true; // realtime transport
  if (url.pathname.startsWith('/api/')) return true;       // dynamic API
  if (url.pathname.startsWith('/uploads/')) return true;   // user video files (large)
  return false;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== SHELL_CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Allow the page to tell a waiting SW to take over immediately.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (isBypassed(url, request)) return; // let the browser handle it normally

  // Navigations (opening the app / room links): network-first.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Cache the shell HTML for offline opening.
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put('/index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    );
    return;
  }

  // Static shell assets: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
