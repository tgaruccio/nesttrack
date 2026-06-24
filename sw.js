// Nest Track Service Worker
// Must be hosted at: https://app.garucciogroup.com/sw.js

const CACHE = 'nesttrack-v3';
const OFFLINE = ['/'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(OFFLINE); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.mode === 'navigate') {
    var url = new URL(e.request.url);
    // Standalone landing pages must NEVER fall back to the app shell ('/').
    // Let them load straight from the network/file. Only the app root ('/')
    // gets the offline fallback.
    if (/\.html$/i.test(url.pathname)) {
      e.respondWith(fetch(e.request));
      return;
    }
    e.respondWith(fetch(e.request).catch(function(){ return caches.match('/'); }));
  }
});

self.addEventListener('push', function(e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch(err) { d = { title: 'Nest Track', body: e.data ? e.data.text() : 'New notification' }; }
  e.waitUntil(
    self.registration.showNotification(d.title || 'Nest Track', {
      body: d.body || 'You have a new message',
      icon: d.icon || '/icon-192.png',
      badge: d.badge || '/icon-192.png',
      vibrate: [200, 100, 200],
      data: { url: d.url || '/' },
      tag: 'nesttrack-msg',
      renotify: true
    })
  );
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(cs) {
      for (var i = 0; i < cs.length; i++) {
        if ('focus' in cs[i]) return cs[i].focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
