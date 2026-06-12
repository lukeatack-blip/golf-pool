var CACHE = 'golfpool-v2';
var SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './us-open-logo.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(SHELL); })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; })
        .map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // The page itself: try the network first so edits go live immediately,
  // fall back to the cached copy when offline.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(function() { return caches.match('./index.html'); })
    );
    return;
  }

  // Icons and manifest: cached copy is fine.
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(function(r) { return r || fetch(e.request); })
    );
  }
  // Anything cross-origin (the Apps Script data call) goes straight to the network.
});
