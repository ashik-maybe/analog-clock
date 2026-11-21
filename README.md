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

Deploy at the /analog-clock/ project path. Vite base, manifest paths and service worker paths all use that prefix.

## CI/CD

The GitHub Actions workflow builds with Bun on every push to main. It uploads dist and deploys it through GitHub Pages. Set the repository Pages source to GitHub Actions.

## PWA

PWA-related files:

- `public/manifest.webmanifest`
- `public/sw.js`
- `public/icons/`

Service worker registers only in production builds; dev mode unregisters old SWs and clears app caches. Once loaded online, the clock opens offline. `CACHE_VERSION` must change when precached paths change.

## Maintenance

Bump `CACHE_VERSION` in `public/sw.js` whenever precached HTML/manifest/icons change, otherwise returning visitors may get stale assets.

## Notes

Unused Vite starter files were removed.
