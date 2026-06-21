/**
 * Minimal service worker — makes Speakwell installable (Add-to-Home-Screen) and gives
 * an offline app-shell. Same-origin GETs are network-first with a cache fallback;
 * the API, the Gemini live socket, and all cross-origin requests are never touched.
 */
const CACHE = 'speakwell-shell-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // leave API / Gemini / CDN alone

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('/'))),
  );
});
