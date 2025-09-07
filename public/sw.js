const CACHE_NAME = "catalyst-pwa-v2";
const LOGO_URLS = [
  // App/logos used across the app (remote)
  "https://cdn.builder.io/api/v1/image/assets%2Fb0ce78c613014eb194e6c86c886e717d%2F8a8e0cb23614495a9f5637c129cc7c00?format=webp&width=192",
  "https://cdn.builder.io/api/v1/image/assets%2Fb0ce78c613014eb194e6c86c886e717d%2Fe7cb74a8d70c41d684ed641a5e36b2ea?format=webp&width=512",
  // Icons used in index.html (preload larger size for apple-touch/favicon)
  "https://cdn.builder.io/api/v1/image/assets%2Fb0ce78c613014eb194e6c86c886e717d%2F8a8e0cb23614495a9f5637c129cc7c00?format=webp&width=800",
  "https://cdn.builder.io/api/v1/image/assets%2Fb0ce78c613014eb194e6c86c886e717d%2Fe7cb74a8d70c41d684ed641a5e36b2ea?format=webp&width=800",
];
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/placeholder.svg",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        await cache.addAll(APP_SHELL);
      } catch (_) {}
      // Best-effort cache of remote logos for offline branding
      try {
        await Promise.all(
          LOGO_URLS.map((url) => cache.add(new Request(url, { mode: "no-cors" }))),
        );
      } catch (_) {}
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Network-first for same-origin navigation and HTML
  if (
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html")
  ) {
    event.respondWith(fetch(req).catch(() => caches.match("/index.html")));
    return;
  }

  // Cache-first for static assets with offline fallback for images
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(async () => {
          if (cached) return cached;
          if (req.destination === "image") {
            const placeholder = await caches.match("/placeholder.svg");
            if (placeholder) return placeholder;
          }
          return Response.error();
        });
      return cached || fetchPromise;
    }),
  );
});
