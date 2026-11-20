# Analog Clock

A self-contained analog clock web app. The clock UI lives in `index.html`; PWA assets (manifest, service worker, icons) live under `public/`. Shows local time, supports light and dark themes, and includes a theme toggle.

## Setup (Bun)

```sh
bun install
bun run dev
bun run build
bun run preview
```

## Deployment

Deploy the built output as static files. HTTPS is required for PWA install.

Deploy at the domain root: the manifest, SW precache list, and icon paths use root-absolute URLs (`/manifest.webmanifest`, `/sw.js`, `/icons/...`), so a subpath deploy will break install/offline.

## PWA

PWA-related files:

- `public/manifest.webmanifest`
- `public/sw.js`
- `public/icons/`

Service worker registers only in production builds; dev mode unregisters old SWs and clears app caches. Once loaded online, the clock opens offline.

## Maintenance

Bump `CACHE_VERSION` in `public/sw.js` whenever precached HTML/manifest/icons change, otherwise returning visitors may get stale assets.

## Notes

Unused Vite starter files were removed.
