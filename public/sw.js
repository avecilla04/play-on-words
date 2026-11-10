// ============================================================
// SERVICE WORKER: notificaciones de Play on Words
// ============================================================

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Play on Words";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "¡Es hora de practicar tu vocabulario!",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "daily-reminder",
      renotify: true,
      data: { url: data.url || "/protected/play" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = new URL(
    (event.notification.data && event.notification.data.url) ||
      "/protected/play",
    self.location.origin
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }

        return self.clients.openWindow(url);
      })
  );
});
