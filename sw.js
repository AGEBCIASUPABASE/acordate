// Trabajador de servicio de Acordate: funciona sin conexión y gestiona los botones de los avisos.
const V='acordate-v1';
const ARCHIVOS=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(ARCHIVOS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put('./index.html',c));return res}).catch(()=>caches.match('./index.html')));return}
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res})));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();const d=e.notification.data||{},accion=e.action||'abrir';
  const url=new URL('./',self.registration.scope);if(d.k){url.searchParams.set('accion',accion);url.searchParams.set('k',d.k)}
  e.waitUntil((async()=>{const cs=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const c of cs){c.postMessage({tipo:'accion',accion,k:d.k});if(accion==='abrir'||!d.k)return c.focus();return}
    if(accion==='abrir'||!d.k)return self.clients.openWindow(url.href);
    return self.clients.openWindow(url.href)})());
});
