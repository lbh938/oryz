// Service Worker pour ORYZ STREAM PWA
const CACHE_NAME = 'oryz-stream-v2'; // Incrémenté pour forcer la mise à jour
const urlsToCache = [
  '/',
  '/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('📦 Installation du Service Worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache ouvert');
        return cache.addAll(urlsToCache).catch((err) => {
          console.warn('⚠️ Erreur cache:', err);
          // Ne pas bloquer l'installation si le cache échoue
        });
      })
      .then(() => {
        // Forcer l'activation immédiate
        return self.skipWaiting();
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('🔄 Activation du Service Worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Prendre le contrôle de toutes les pages immédiatement
      return self.clients.claim();
    }).then(() => {
      console.log('✅ Service Worker activé et prêt');
    })
  );
});

// Interception des requêtes - simplifié pour éviter les erreurs
self.addEventListener('fetch', (event) => {
  // Pour les requêtes GET seulement
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    fetch(event.request).catch(() => {
      // Si le réseau échoue, essayer le cache
      return caches.match(event.request);
    })
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  let data = {
    title: 'ORYZ',
    body: 'Nouvelle notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: data.data || { dateOfArrival: Date.now() },
    actions: data.actions || [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Fermer' }
    ],
    tag: data.tag || 'oryz-notification',
    requireInteraction: data.requireInteraction || false
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Ouvrir l'application ou naviguer vers une page spécifique
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si une fenêtre est déjà ouverte, la focus
        for (let client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          const urlToOpen = event.notification.data?.url || '/';
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Gestion de la fermeture des notifications
self.addEventListener('notificationclose', (event) => {
  console.log('Notification fermée:', event.notification.tag);
});
