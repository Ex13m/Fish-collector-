/* FISH COLLECTOR service worker — офлайн-кэш статики, свежий HTML из сети.
   ВАЖНО: при каждом релизе бампать V и APP_VERSION (index.html) синхронно,
   иначе пользователь застрянет на старой версии из кэша (скил bump-version). */
const V = 'fishcollector-v3.3.0';
const ASSETS = ['./', './index.html', './manifest.json', './icon.svg', './logo.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // HTML/навигация — сначала сеть (свежая версия), офлайн → кэш
  const isDoc = req.mode === 'navigate' || req.destination === 'document'
    || url.pathname === '/' || url.pathname.endsWith('.html');
  if (isDoc) {
    e.respondWith(
      fetch(req).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(req, c)).catch(() => {}); return res; })
        .catch(() => caches.match(req).then(h => h || caches.match('./index.html')))
    );
    return;
  }
  // Шрифты Google и прочая статика — сначала кэш, параллельно обновляем
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(V).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => hit))
  );
});
