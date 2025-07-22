const CACHE_NAME = 'enarmax-v4';
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
  'js/Sortable.min.js',
  'js/markdown-it.min.js',
  'js/katex.min.js',
  'js/katex.min.css'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});
const CDN_TO_LOCAL = [
  {prefix: 'https://cdn.jsdelivr.net/npm/sortablejs', local: 'js/Sortable.min.js'},
  {prefix: 'https://cdn.jsdelivr.net/npm/markdown-it', local: 'js/markdown-it.min.js'},
  {prefix: 'https://cdn.jsdelivr.net/npm/katex/dist/katex.min.js', local: 'js/katex.min.js'},
  {prefix: 'https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css', local: 'js/katex.min.css'}
];

self.addEventListener('fetch', e => {
  const { request } = e;
  const mapping = CDN_TO_LOCAL.find(m => request.url.startsWith(m.prefix));
  if (mapping) {
    e.respondWith(caches.match(mapping.local));
    return;
  }
  e.respondWith(caches.match(request).then(r => r || fetch(request)));
});
