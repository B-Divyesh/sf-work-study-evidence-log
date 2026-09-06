import { createReadStream } from 'node:fs';
import { access, readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';

const host = '127.0.0.1';
const port = Number(process.env.PORT || '4173');
const root = resolve(new URL('../dist/', import.meta.url).pathname);
const config = JSON.parse(await readFile(join(root, 'staticwebapp.config.json'), 'utf8'));

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8'
};

function routeHeaders(pathname) {
  const route = config.routes?.find((item) => item.route === pathname || (item.route.endsWith('/*') && pathname.startsWith(item.route.slice(0, -1))));
  return { ...config.globalHeaders, ...route?.headers };
}

function contentType(file) {
  return mimeTypes[extname(file)] || 'application/octet-stream';
}

async function regularFile(pathname) {
  const decoded = decodeURIComponent(pathname);
  const candidate = normalize(join(root, decoded));
  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) return null;
  try {
    const fileStat = await stat(candidate);
    if (fileStat.isFile()) return candidate;
    if (fileStat.isDirectory()) {
      const index = join(candidate, 'index.html');
      await access(index);
      return index;
    }
  } catch {
    return null;
  }
  return null;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${host}:${port}`);
  let pathname = url.pathname;

  // Azure Static Web Apps reads this deployment setting but deliberately does
  // not expose it at runtime. Keeping that behavior here makes PWA tests host-faithful.
  if (pathname === '/staticwebapp.config.json') pathname = '/does-not-exist';
  if (pathname === '/demo') pathname = '/index.html';

  let file = await regularFile(pathname);
  let status = 200;
  if (!file) {
    status = 404;
    file = join(root, '404.html');
  }

  response.writeHead(status, {
    ...routeHeaders(url.pathname),
    'Content-Type': contentType(file)
  });
  createReadStream(file).pipe(response);
});

server.listen(port, host, () => {
  process.stdout.write(`Production-like preview listening on http://${host}:${port}\n`);
});
