// GASO Cross Dock Analytics · funcionamiento sin internet de la versión web.
// Primero intenta la red (para tener siempre la versión más reciente) y, si no hay conexión,
// usa la copia guardada. Las consultas a la nube (Supabase) no se guardan aquí.
const CACHE = 'gaso-web-202610121649';
const BASICOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=> c.addAll(BASICOS)).then(()=> self.skipWaiting()));
});
self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(ks=> Promise.all(ks.filter(k=> k !== CACHE).map(k=> caches.delete(k)))).then(()=> self.clients.claim()));
});
self.addEventListener('fetch', (e)=>{
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(res=>{
      if (res && res.ok){ const copia = res.clone(); caches.open(CACHE).then(c=> c.put(req, copia)); }
      return res;
    }).catch(()=> caches.match(req, { ignoreSearch:true }).then(r=> r || caches.match('./index.html')))
  );
});
