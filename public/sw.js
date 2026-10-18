/* Offline support: serves the app shell from cache and refreshes it in the background.
   Bump CACHE when shipping changes so old caches are cleared. */
const CACHE = "overload-v5";
const SHELL = ["./", "index.html", "privacy.html", "styles.css", "app.js", "merge.js", "manifest.webmanifest",
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
    const cached = await cache.match(req, { ignoreSearch: sameOrigin });
    // Offline and never cached: open the app itself for page loads.
    const fallback = async () => cached || (req.mode === "navigate" ? await cache.match("index.html") : undefined) || Response.error();
    const network = fetch(req).then((res) => {
      if (res.ok || res.type === "opaque") cache.put(req, res.clone());
      return res;
    }).catch(fallback);
    if (cached) { e.waitUntil(network.catch(() => {})); return cached; }
    return network;
  }));
});

/* Workout reminders sent by the server. */
self.addEventListener("push", (e) => {
  let msg = {};
  try { msg = e.data ? e.data.json() : {}; } catch (err) { /* show the default text */ }
  e.waitUntil(self.registration.showNotification(msg.title || "Time to train", {
    body: msg.body || "Your workout is ready.",
    icon: "icons/icon-192.png",
    badge: "icons/icon-192.png",
    tag: "workout-reminder",
    renotify: true,
    data: { url: msg.url || "./#train" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL(e.notification.data && e.notification.data.url || "./#train", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
    const open = wins.find((w) => w.url.startsWith(self.registration.scope));
    if (open) { open.navigate(url).catch(() => {}); return open.focus(); }
    return self.clients.openWindow(url);
  }));
});
