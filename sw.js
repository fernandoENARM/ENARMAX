const CACHE_NAME = 'enarmax-v2';
const ASSETS = [
  '/',
  'index.html',
  'flashcards.html',
  'cloze.html',
  'exam.html',
  'styles.css',
  'app.js',
  'cloze.js',
  'main.js',
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
