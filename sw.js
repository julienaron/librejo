// Librejo prototype : mise en cache du code pour fonctionner hors ligne.
// Aucune donnée de la structure ne passe par ici.
const VERSION = 'librejo-proto-1';
const FICHIERS = ['./', 'index.html', 'app.js', 'style.css', 'logo.svg', 'manifest.webmanifest',
  'favicon.ico', 'favicon.svg', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Réseau d'abord (pour recevoir les mises à jour), cache en secours (hors ligne).
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copie = r.clone();
      caches.open(VERSION).then(c => c.put(e.request, copie)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match('index.html')))
  );
});
