const CACHE_VERSION = 'web-utilities-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.ico',
  './brand-icon.svg',
  './icons/icon-32.png',
  './icons/icon-48.png',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-150.png',
  './icons/icon-152.png',
  './icons/icon-167.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-256.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
  './icons/maskable-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then(async (cache) => {
        await cache.addAll(CORE_ASSETS);
        await cacheBuildAssets(cache).catch(() => undefined);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (shouldCache(request)) {
    event.respondWith(cacheFirst(request));
  }
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_VERSION);

  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch {
    return (
      (await cache.match(request)) ||
      (await cache.match('./index.html')) ||
      (await cache.match('./'))
    );
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    cache.put(request, response.clone());
  }

  return response;
}

function shouldCache(request) {
  return ['font', 'image', 'manifest', 'script', 'style', 'worker'].includes(
    request.destination
  );
}

async function cacheBuildAssets(cache) {
  const response = await fetch('./', { cache: 'reload' });

  if (!response.ok) {
    return;
  }

  const html = await response.clone().text();
  await cache.put('./', response.clone());
  await cache.put('./index.html', response);

  const assetUrls = new Set();
  const assetPattern = /\b(?:href|src)="([^"]+)"/g;
  let match;

  while ((match = assetPattern.exec(html)) !== null) {
    const url = new URL(match[1], self.location.href);

    if (url.origin === self.location.origin) {
      assetUrls.add(url.href);
    }
  }

  await Promise.all(
    [...assetUrls].map((url) =>
      fetch(url)
        .then((assetResponse) => {
          if (assetResponse.ok) {
            return cache.put(url, assetResponse);
          }

          return undefined;
        })
        .catch(() => undefined)
    )
  );
}
