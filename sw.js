// Librejo : met en cache le code du site pour fonctionner hors ligne. Les documents de la structure ne passent jamais par ici.
const VERSION='librejo-proto3h';
const BASE=['./','index.html','boot.js','boot.css','logo.svg','manifest.webmanifest','favicon.ico','favicon.svg','app/polices.css',
 'app/lib/jspdf.umd.min.js','app/lib/jszip.min.js','app/lib/pdf-lib.min.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(VERSION).then(c=>c.addAll(BASE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin) return;
  if(/\/app\/(parametres|donnees|annuaire|logo-association)\.js$/.test(u.pathname)) return; // jamais de réglages depuis le site
  e.respondWith(fetch(e.request).then(r=>{ if(r.ok){ const c=r.clone(); caches.open(VERSION).then(x=>x.put(e.request,c)); } return r; })
    .catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));
});
