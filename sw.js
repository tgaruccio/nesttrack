self.addEventListener('push', function(event) {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'New Message',
      body: event.data ? event.data.text() : 'You have a new message'
    };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Nest Track', {
      body: data.body || 'You have a new message',
      icon: '/icon.png',
      badge: '/icon.png'
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
