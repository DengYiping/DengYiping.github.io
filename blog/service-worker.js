/* Migration endpoint for visitors with the previous React site's worker. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const oldCache = `sw-precache-v3-sw-precache-webpack-plugin-${self.registration.scope}`;
    const oldCaches = (await caches.keys()).filter(key => key === oldCache);
    await Promise.all(oldCaches.map(key => caches.delete(key)));
    await self.clients.claim();
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const client of clients) {
      const url = new URL(client.url);
      const ownPage = /^\/(?:$|index\.html$|algorithm\.html$|blog(?:\/|$)|post\/)/.test(url.pathname);
      if (client.url.startsWith(self.registration.scope) && ownPage) await client.navigate(client.url);
    }
  })());
});
