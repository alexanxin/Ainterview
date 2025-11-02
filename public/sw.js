// sw.js - Service Worker for Ainterview PWA
const CACHE_NAME = 'ainterview-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available, otherwise fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Listen for push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'You have a new notification',
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-192x192.svg',
      tag: data.tag || 'ainterview-notification'
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Ainterview', options)
    );
  }
});