// Cache ismi ve versiyonu
const CACHE_NAME = 'memorama-kids-v1';

// Önbelleğe alınacak dosyalar
const filesToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Service Worker Kurulumu
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Önbellek açıldı');
        return cache.addAll(filesToCache);
      })
  );
});

// Aktif olma olayı - eski önbellekleri temizler
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Fetch olayı - önbellekten veya ağdan kaynak alır
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Önbellekte varsa oradan döndür
        if (response) {
          return response;
        }
        
        // Önbellekte yoksa ağdan getir
        return fetch(event.request)
          .then(response => {
            // Geçerli bir yanıt değilse doğrudan döndür
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Yanıtı önbelleğe almak için klonla (stream olduğu için)
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
  );
});