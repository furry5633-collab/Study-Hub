/* Service worker local: no APIs, no métricas, no subida de datos. */
const CORE='studyhub-core-1.1.0';
const OCR='studyhub-ocr-5.1.1-legacy';
const ROOT=new URL('./',self.location.href).href;
const SHELL=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CORE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('studyhub-core-')&&k!==CORE).map(k=>caches.delete(k)))),self.clients.claim()]));});
function isOCR(u){
  return (['cdn.jsdelivr.net','unpkg.com','cdnjs.cloudflare.com'].includes(u.hostname)&&/tesseract/.test(u.pathname)) ||
    (u.hostname==='tessdata.projectnaptha.com'&&u.pathname.startsWith('/4.0.0/')) ||
    (u.origin===self.location.origin&&u.href.startsWith(ROOT+'assets/ocr/'));
}
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const url=new URL(r.url);
  if(isOCR(url)){
    e.respondWith((async()=>{
      const cache=await caches.open(OCR),cached=await cache.match(r);if(cached)return cached;
      const response=await fetch(r);if(!response.ok)return response;
      // Materializar la respuesta evita errores de Cache.put() con streams binarios
      // grandes en algunos Chromium. Si falta cuota, el OCR sigue funcionando.
      const bytes=await response.arrayBuffer(),headers=new Headers(response.headers);
      headers.delete('content-length');headers.delete('content-encoding');headers.delete('transfer-encoding');
      const buffered=new Response(bytes,{status:response.status,statusText:response.statusText,headers});
      try{await cache.put(r,buffered.clone());}catch(e){/* Caché opcional, nunca inventar disponibilidad offline. */}
      return buffered;
    })());return;
  }
  if(url.origin!==self.location.origin||!url.href.startsWith(ROOT))return;
  if(r.mode==='navigate'||SHELL.some(path=>new URL(path,ROOT).pathname===url.pathname)){
    e.respondWith((async()=>{
      const cache=await caches.open(CORE);
      try{const response=await fetch(r);if(response.ok)await cache.put(r,response.clone());return response;}
      catch(e){return await cache.match(r)||await cache.match(new URL('./index.html',ROOT).href)||Response.error();}
    })());
  }
});
