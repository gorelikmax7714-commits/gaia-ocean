// BUMP this version string on EVERY deploy — cache-first serves stale files until it changes.
const CACHE = 'gaya-v3';
const ASSETS = [
  '.', 'index.html', 'manifest.json', 'css/base.css',
  'assets/icon.svg', 'assets/pet.js',
  'js/app.js', 'js/config.js', 'js/storage.js', 'js/sync.js', 'js/audio.js',
  'js/engine/rng.js', 'js/engine/topics.js', 'js/engine/visuals.js',
  'js/engine/progression.js', 'js/engine/srs.js', 'js/engine/pet.js',
  'js/ui/widgets.js',
  'js/screens/index.js', 'js/screens/onboarding.js', 'js/screens/lagoon.js',
  'js/screens/map.js', 'js/screens/practice.js', 'js/screens/lesson.js', 'js/screens/reward.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return; // sync POSTs pass through
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true })
      .then((hit) => hit ?? fetch(e.request)),
  );
});
