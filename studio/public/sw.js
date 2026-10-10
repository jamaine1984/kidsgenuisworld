// Network-only transition worker. Learner progress is saved by the app separately.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(
 caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('kid-genius-world-pwa-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));
