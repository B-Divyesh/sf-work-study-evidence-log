# Practice Evidence Log

Practice Evidence Log helps working professionals connect short practice blocks to later work use. It keeps private records without scores or employee reporting.

Live product: <https://work-study-evidence-log.sociobot.in>

Try sample data: <https://work-study-evidence-log.sociobot.in/demo>. The demo uses separate storage and never changes your real log.

## What v1 includes

- Create, edit, and delete practice blocks; attach later work-use notes
- Reject blank required text and work-use dates before the practice date
- Keep records in IndexedDB with no account or analytics
- Export JSON and CSV, then restore a valid JSON backup
- Reload offline after the first online visit
- Notify an open page when an updated service worker is ready
- Automatic, light, and dark kiln themes with keyboard and mobile access
- Optional US $12 one-time Evidence Pass for the archive lens and printable review
- Static `/privacy/` and `/terms/` pages

Weekly logging and JSON or CSV export are free. License verification sends only its token to Sociobot’s API, never log content.

## Run and verify

Requires Node.js 22 or a compatible current LTS release.

```sh
npm ci
npm run dev
```

Quality commands:

```sh
npm test          # unit tests
npm run check     # TypeScript
npm run lint      # static lint gate
npm run test:e2e  # production build + Playwright/axe/offline checks
npm run test:claims # every registered product claim
npm run build     # reproducible static output in ./dist
```

Playwright is pinned to `1.58.2`. In the factory worker, installed browsers are read from `PLAYWRIGHT_BROWSERS_PATH`.

## Configuration

Production license checkout and verification default to `https://api.sociobot.in`. For a registered staging product, set this at build time:

```sh
VITE_BILLING_BASE_URL=https://pilot-api.sociobot.in npm run build
```

No product ID is embedded; billing routes use the public product slug.

## Deploy

Run `npm run build` and publish `dist/` as a static site. Its checked-in response policy config handles `/demo`, legal routes, caching, security headers, and 404s.

## Data and recovery

Records stay in the current browser profile. Clearing site data, using ephemeral private browsing, or losing the device can remove them. Use **Data & access → Export JSON** for a portable backup. Import deliberately replaces the current local log after confirmation.

See [`.factory/brief.json`](.factory/brief.json) for the product brief and [`.factory/design.md`](.factory/design.md) for the visual system and original-asset provenance.

## License

MIT — see [`LICENSE`](LICENSE).
