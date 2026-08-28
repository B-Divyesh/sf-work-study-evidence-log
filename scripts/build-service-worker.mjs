import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('../dist/', import.meta.url);

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  }));
  return files.flat();
}

const paths = (await filesIn(root.pathname))
  .filter((path) => !path.endsWith('/sw.js'))
  .map((path) => `/${relative(root.pathname, path).replaceAll('\\', '/')}`)
  .filter((path) => !path.includes('ceramic-transfer.png'));
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const buildAsset = paths.find((path) => path.includes('/assets/app-')) ?? 'shell';
const cacheName = `practice-evidence-${packageJson.version}-${buildAsset.match(/app-([^./]+)/)?.[1] ?? 'shell'}`;

const source = `const CACHE = ${JSON.stringify(cacheName)};
const PRECACHE = ${JSON.stringify(paths)};
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => Promise.all(PRECACHE.map(async url => {
  const response = await fetch(new Request(url, { cache: 'reload' }));
  if (!response.ok) throw new Error('Could not precache ' + url);
  const body = await response.arrayBuffer();
  await cache.put(url, new Response(body, { status: 200, headers: {
    'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
    'Cache-Control': 'public, max-age=31536000, immutable'
  }}));
})))));
self.addEventListener('activate', event => event.waitUntil(Promise.all([
  caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))),
  self.clients.claim()
])));
self.addEventListener('message', event => { if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response;
    }).catch(async () => (await caches.match(event.request)) || (await caches.match('/index.html')) || caches.match('/offline.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
    return response;
  })));
});
`;

await writeFile(new URL('../dist/sw.js', import.meta.url), source);
