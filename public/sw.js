const CACHE = 'practice-evidence-dev-v1';
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => Promise.all(['/','/offline.html','/manifest.webmanifest'].map(async (url) => {
  const response = await fetch(new Request(url, { cache: 'reload' }));
  const body = await response.arrayBuffer();
  return cache.put(url, new Response(body, { status: 200, headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream' } }));
})))));
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('message', (event) => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then((response) => response || (event.request.mode === 'navigate' ? caches.match('/offline.html') : Response.error()))));
});
