const CACHE_NAME = 'enarmax-v2';
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
  'js/chart.min.js',
  'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js',
  'https://cdn.jsdelivr.net/npm/markdown-it/dist/markdown-it.min.js',
  'https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css',
  'https://cdn.jsdelivr.net/npm/katex/dist/katex.min.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
