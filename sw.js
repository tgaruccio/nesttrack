self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('push', function(event) {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'Nest Track',
      body: event.data ? event.data.text() : 'You have a new message'
    };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Nest Track', {
      body: data.body || 'You have a new message',
      icon: '/icon.png',
      badge: '/icon.png',
      vibrate: [200, 100, 200]
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(function(cs) {
      var c = cs.find(function(x) { return 'focus' in x; });
      if (c) return c.focus();
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
