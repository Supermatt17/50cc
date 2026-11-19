/* Hors ligne : la page est toujours redemandée au site (sans passer par la mémoire du navigateur) pour avoir la dernière mise à jour ; sans réseau, la copie gardée sert. */
const CACHE = "cc50-v3";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).catch(() => {})); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const url = new URL(r.url);
  if (/goatcounter\.com$|(^|\.)zgo\.at$/.test(url.hostname)) return;   // compteur de visites : jamais mis en cache
  if (r.mode === "navigate" || (url.origin === location.origin && /\/(index\.html)?$/.test(url.pathname))) {
    e.respondWith(fetch(r.url, { cache: "no-cache" }).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put("index.html", cp)); return res; })
      .catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
    if (res.ok || res.type === "opaque") { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
    return res;
  }).catch(() => hit)));
});
