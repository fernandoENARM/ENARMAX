const CACHE_NAME = 'enarmax-v1';
const ASSETS = [
  '/',
  'index.html',
  'flashcards.html',
  'cloze.html',
  'styles.css',
  'app.js',
  'cloze.js',
  'js/chart.min.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
