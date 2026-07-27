// Service worker do Painel — rede primeiro, cache de reserva (offline).
const CACHE = 'painel-v2';
const ESSENCIAL = ['./', './app-192.png', './app-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ESSENCIAL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return;      // nao intercepta o iframe do site
  e.respondWith(
    fetch(e.request).then(r => {
      const copia = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copia)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./') || new Response(
      '<!doctype html><meta charset=utf-8><title>Sem internet</title>' +
      '<body style="background:#0e0d0b;color:#f0ebe2;font-family:system-ui;text-align:center;padding:60px 24px">' +
      '<h1 style="color:#d4af37">📴 Sem internet</h1>' +
      '<p style="color:#8a8377">Seu painel volta assim que a conexão voltar.</p>',
      {headers: {'Content-Type': 'text/html; charset=utf-8'}})))
  );
});
