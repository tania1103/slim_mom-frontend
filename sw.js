/* eslint-env serviceworker */

// Service Worker for PWA functionality
const CACHE_NAME = 'slimmom-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }

        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response because it's a stream
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Return offline page if available
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }

        // Return a fallback for other requests
        return new Response('Offline - Content not available', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null; // Return null for caches we want to keep
        })
      );
    })
  );
});

// Push notification event
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});

// Background sync event
self.addEventListener('sync', event => {
  if (event.tag === 'diary-sync') {
    event.waitUntil(
      // Sync diary data when online
      syncDiaryData()
    );
  }
});

// Helper function to sync diary data
async function syncDiaryData() {
  try {
    // Get pending diary entries from IndexedDB
    const pendingEntries = await getPendingDiaryEntries();

    if (pendingEntries.length > 0) {
      // Sync each entry
      for (const entry of pendingEntries) {
        await syncDiaryEntry(entry);
      }

      // Clear pending entries after successful sync
      await clearPendingDiaryEntries();
    }
  } catch (error) {
    console.error('Diary sync failed:', error);
  }
}

// Helper functions for IndexedDB operations
async function getPendingDiaryEntries() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SlimMomDB', 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingEntries'], 'readonly');
      const store = transaction.objectStore('pendingEntries');
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };

      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function syncDiaryEntry(entry) {
  try {
    const response = await fetch('/api/diary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${entry.token}`
      },
      body: JSON.stringify(entry.data)
    });

    if (!response.ok) {
      throw new Error('Failed to sync diary entry');
    }

    return response.json();
  } catch (error) {
    console.error('Error syncing diary entry:', error);
    throw error;
  }
}

async function clearPendingDiaryEntries() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SlimMomDB', 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingEntries'], 'readwrite');
      const store = transaction.objectStore('pendingEntries');
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        resolve();
      };

      clearRequest.onerror = () => {
        reject(clearRequest.error);
      };
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
