// Lions × Dragons soundboard — service worker
// VERSION is bumped on every deploy so phones pick up the new app shell.
const VERSION = 'dev';
const SHELL_CACHE = `lxd-shell-${VERSION}`;
const AUDIO_CACHE = 'lxd-audio-v1'; // shared with js/app.js — don't rename casually

const SHELL = [
  'index.html',
  'css/app.css',
  'js/app.js',
  'js/tracks.js',
  'manifest.webmanifest',
  'assets/lions-logo.webp',
  'assets/dragons-logo.webp',
  'assets/arena.webp',
  'assets/arena.jpg',
  'assets/fonts/barlow-condensed-latin-600-normal.woff2',
  'assets/fonts/barlow-condensed-latin-700-normal.woff2',
  'assets/fonts/barlow-condensed-latin-800-normal.woff2',
  'assets/fonts/barlow-condensed-latin-800-italic.woff2',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/favicon-32.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((c) => c.addAll(SHELL.map((p) => new Request(p, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('lxd-shell-') && k !== SHELL_CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.toLowerCase().endsWith('.mp3')) {
    event.respondWith(audio(event));
  } else if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req));
  } else {
    event.respondWith(staleWhileRevalidate(event));
  }
});

async function networkFirst(req) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put('index.html', res.clone());
    return res;
  } catch (_) {
    return (await cache.match('index.html')) || Response.error();
  }
}

async function staleWhileRevalidate(event) {
  const req = event.request;
  const cache = await caches.open(SHELL_CACHE);
  const hit = await cache.match(req, { ignoreSearch: true });
  const update = fetch(req).then((res) => {
    if (res.ok && res.status === 200) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  if (hit) { event.waitUntil(update); return hit; }
  return (await update) || Response.error();
}

// Audio: serve from cache (with byte-range support for Safari), otherwise
// stream from the network and keep a full copy for next time.
async function audio(event) {
  const req = event.request;
  const url = req.url.split('#')[0];
  const cache = await caches.open(AUDIO_CACHE);
  const hit = await cache.match(url, { ignoreVary: true }); // ?v=N marks a new cut
  if (hit) return rangeResponse(hit, req.headers.get('range'));

  event.waitUntil((async () => {
    try {
      const full = await fetch(url, { cache: 'no-store' });
      if (full.ok && full.status === 200) await cache.put(url, full);
    } catch (_) { /* offline — nothing to cache */ }
  })());
  return fetch(req);
}

async function rangeResponse(res, range) {
  const blob = await res.blob();
  const type = res.headers.get('content-type') || 'audio/mpeg';
  const size = blob.size;
  if (!range) {
    return new Response(blob, { status: 200, headers: { 'Content-Type': type, 'Content-Length': String(size), 'Accept-Ranges': 'bytes' } });
  }
  const m = /bytes=(\d*)-(\d*)/.exec(range);
  let start = 0; let end = size - 1;
  if (m) {
    if (m[1] === '' && m[2] !== '') { start = Math.max(0, size - Number(m[2])); }
    else {
      start = Number(m[1] || 0);
      if (m[2] !== '') end = Math.min(Number(m[2]), size - 1);
    }
  }
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }
  const chunk = blob.slice(start, end + 1, type);
  return new Response(chunk, {
    status: 206,
    headers: {
      'Content-Type': type,
      'Content-Length': String(chunk.size),
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
    },
  });
}
