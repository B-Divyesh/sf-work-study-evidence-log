# Practice Evidence Log

Practice Evidence Log is a private, local-first PWA for working professionals who study in short blocks and want to notice where that practice later helps. A record keeps the topic, 10–60 minute duration, source, one retrieval prompt, an optional open question, and later de-identified work-use notes. It intentionally has no streaks, scores, employee reporting, or performance claims.

Live product: <https://work-study-evidence-log.sociobot.in>

## What v1 includes

- A Monday–Sunday weekly evidence shelf with full week navigation
- Add, edit, and delete practice blocks; attach or remove later application notes
- IndexedDB persistence with no account and no analytics
- JSON backup/restore and analysis-friendly CSV export
- Installable offline shell with explicit connectivity and update states
- Automatic, light, and dark kiln treatments
- Optional US $12 one-time Evidence Pass: all-weeks archive lens and an on-device printable transfer review
- Static `/privacy/` and `/terms/` pages

The free experience includes unlimited logging, every week, JSON/CSV export, accessibility, and privacy safeguards. License verification sends only a token to the Sociobot billing API; it never sends log content.

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
npm run test:e2e  # production build + Playwright/axe/offline checks
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

Run `npm run build` and publish the `dist/` directory as a static site. `dist/index.html` is the root entry. Configure clean directory routes so `/privacy/` and `/terms/` serve their included `index.html` files. Do not publish source maps or inject runtime third-party scripts.

## Data and recovery

Records stay in the current browser profile. Clearing site data, using ephemeral private browsing, or losing the device can remove them. Use **Data & access → Export JSON** for a portable backup. Import deliberately replaces the current local log after confirmation.

See [`.factory/brief.json`](.factory/brief.json) for the product brief and [`.factory/design.md`](.factory/design.md) for the visual system and original-asset provenance.

## License

MIT — see [`LICENSE`](LICENSE).
