const CACHE = 'pravka-pdf-a5b696156f';
const ASSETS = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "fonts/PTMono-Regular.ttf", "fonts/PTSans-Bold.ttf", "fonts/PTSans-Regular.ttf", "fonts/PTSerif-Bold.ttf", "fonts/PTSerif-Regular.ttf", "fonts/Roboto-Bold.ttf", "fonts/Roboto-Regular.ttf", "vendor/pdf.min.js", "vendor/pdf.worker.min.js", "vendor/pdf-lib.min.js", "vendor/fontkit.umd.min.js"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Сначала кэш: приложение открывается без сети. Новая версия приходит вместе с новым sw.js
// (build.py меняет CACHE при любой правке), шрифты интерфейса с Google кэшируются при первом показе.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const hit = await cache.match(e.request, { ignoreSearch: true });
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    })
  );
});
