# PWA decision (Wave 2)

Kept: `pwa/manifest.json` and icons (copied into `dist` by Vite).

Removed: service worker. The old Workbox InjectManifest build and `pwa/sw.js` were never registered
(`navigator.serviceWorker.register` stayed commented in `index.html`). Shipping a broken/stale SW
would risk caching wrong hashed assets under Vite. No Workbox / no `sw.js` until a correct Vite
precache worker is added intentionally.
