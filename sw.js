const CACHE_NAME = 'enarmax-v3';
const ASSETS = [
  '/',
  'index.html',
  'flashcards.html',
  'cloze.html',
  'exam.html',
  'study.html',
  'styles.css',
  'app.js',
  'cloze.js',
  'study.js',
  'main.js',
  'js/chart.min.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});
const CDN_URLS = [
  'https://cdn.jsdelivr.net/npm/sortablejs',
  'https://cdn.jsdelivr.net/npm/markdown-it',
  'https://cdn.jsdelivr.net/npm/katex'
];

self.addEventListener('fetch', e => {
  const { request } = e;
  if (CDN_URLS.some(url => request.url.startsWith(url))) {
    e.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(resp => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, resp.clone());
            return resp;
          });
        });
      })
    );
    return;
  }
  e.respondWith(
    caches.match(request).then(r => r || fetch(request))
  );
});
