// Service worker: lets the site load offline and be installed. Generated into sw.js by scripts/assemble.js.
// The cache name below changes whenever the built site changes, which replaces the old cache.
const CACHE='fotw-__VERSION__';
const CORE=['./','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png','__MAP_URL__'];
const FONT_HOSTS=['fonts.googleapis.com','fonts.gstatic.com'];

self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys()
  .then(keys=>Promise.all(keys.filter(k=>k.startsWith('fotw-')&&k!==CACHE).map(k=>caches.delete(k))))
  .then(()=>self.clients.claim()))});

self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // The page: network first so a new deploy shows on the next load; the cached copy is the offline fallback.
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put('./',copy))}return res})
      .catch(()=>caches.match('./')));
    return}
  // Everything else (map.json is versioned, icons, fonts): cache first, filled on first use.
  if(url.origin===self.location.origin||FONT_HOSTS.includes(url.hostname)){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
      if(res.ok||res.type==='opaque'){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}
      return res})))}
});
