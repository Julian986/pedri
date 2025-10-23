// Service Worker con force reload - versión actualizada
const CACHE_NAME = 'pedri-v2-' + new Date().getTime();

self.addEventListener('install', (event) => {
  // Force immediate activation
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Solo cachear manifest, nada más
        return cache.addAll(['/manifest.json']);
      })
  );
});

self.addEventListener('activate', (event) => {
  // Tomar control inmediatamente
  event.waitUntil(
    clients.claim().then(() => {
      // Borrar TODOS los cachés antiguos
      return caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Eliminando caché antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy: siempre ir a la red primero
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // No cachear nada automáticamente
        return response;
      })
      .catch(() => {
        // Solo usar caché como fallback
        return caches.match(event.request);
      })
  );
});

