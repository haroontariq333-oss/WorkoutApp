/* Offline support: serves the app shell from cache and refreshes it in the background.
   Bump CACHE when shipping changes so old caches are cleared. */
const CACHE = "overload-v1";
const SHELL = ["./", "index.html", "styles.css", "app.js", "merge.js", "manifest.webmanifest",
  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png"];
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  if (sameOrigin && url.pathname.includes("/api/")) return; // account and sync calls always go to the network
  if (!sameOrigin && !FONT_HOSTS.includes(url.hostname)) return;

  e.respondWith(caches.open(CACHE).then(async (cache) => {
    const cached = (await cache.match(req, { ignoreSearch: sameOrigin })) ||
      (req.mode === "navigate" ? await cache.match("index.html") : undefined);
    const network = fetch(req).then((res) => {
      if (res.ok || res.type === "opaque") cache.put(req, res.clone());
      return res;
    }).catch(() => cached || Response.error());
    if (cached) { e.waitUntil(network.catch(() => {})); return cached; }
    return network;
  }));
});
