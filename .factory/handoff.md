# Practice Evidence Log — build handoff

Work order: `work-study-evidence-log-build-1`  
Completed: 2026-08-28  
Deploy type: static PWA  
Build command: `npm run build`  
Deploy directory: `dist/` (`dist/index.html` is present at the root)

## What was built

- Finished local-first weekly practice log for 10–60 minute blocks: date, topic, source, retrieval prompt, and optional open question.
- Later work-use notes attach directly to the practice that informed them. Entries and links can be added, edited, or deliberately removed.
- Monday–Sunday navigation works across the complete local history. The interface uses evidence connections rather than streaks, points, time goals, or performance claims.
- IndexedDB persistence survives refresh, tab close, and offline use. Storage failures get an actionable on-screen state.
- Portable JSON backup/replace-import and flattened CSV export. CSV cells with spreadsheet formula prefixes are neutralised.
- Installable PWA with 192/512 icons, maskable icon declaration, versioned/hash-keyed precache, cache-first app assets, offline fallback, connectivity notice, and an explicit update toast. Cached responses are normalised so compressed preview/deploy headers cannot corrupt offline JavaScript.
- Light, dark, and system themes implement the glacial minimal ceramics visual thesis. Mobile behavior was inspected at 390×844.
- Original generated ceramic transfer still life, with source PNG and prompt provenance in `assets/src/`; shipped WebP derivatives are 80,852 bytes desktop and 29,088 bytes mobile.
- Privacy warning is present in both entry flows. There is no analytics, account, tracking, third-party font, or runtime CDN.
- `/privacy/` and `/terms/` are standalone static pages.
- Optional Evidence Pass uses the Sociobot billing contract: hosted checkout, return-token capture and URL cleanup, local token storage, cached daily verification, offline optimistic access, revoked-license handling, and paste-to-restore. The free tier retains unlimited weekly navigation, all logging, export, accessibility, and safety behavior. Paid additions are the archive lens and printable on-device reflection sheet.

## Verification performed

All commands passed against the production build:

```sh
npm test
npm run check
npm run test:e2e
npm run build
npm audit
VERIFY_NODE_MODULES=/work/repo/node_modules /opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ /tmp/pel-verify
```

Results:

- Vitest: 4/4 tests passed (weekly math, import validation, CSV application rows, spreadsheet-injection neutralisation).
- Playwright 1.58.2: 4/4 scenarios passed.
  - Practice → saved record → linked work use → full offline reload with data intact.
  - axe serious/critical scan in both light and dark themes: 0 violations.
  - Keyboard skip-link/dialog path and legal routes.
  - Cached verified license reveals the additive archive/review tools while export stays available.
- Factory `verify-url.sh`: HTTP 200; title present; `lang=en`; one `h1`; main landmark present; 0 images without alt; 0 unlabelled buttons; 0 console/page errors; measured load 571 ms.
- Lighthouse 12.8.2 mobile/local preview: Performance 100, Accessibility 100, Best Practices 100, SEO 100.
  - FCP 0.9 s
  - LCP 1.5 s
  - Total blocking time 0 ms
  - CLS 0
- Production payload (uncompressed): initial JS 29,135 bytes; CSS 17,182 bytes; no webfonts; hero 80,852 bytes desktop / 29,088 bytes mobile.
- `npm audit`: 0 known vulnerabilities.
- PWA icons inspected at exactly 192×192 and 512×512.

## Operational notes / known gaps

- The factory still needs to register the billing product/return URL and ensure the hosted price is US $12 before release. Production defaults to `https://api.sociobot.in`; staging can build with `VITE_BILLING_BASE_URL=https://pilot-api.sociobot.in`.
- Lighthouse and URL verification were run against the local production preview, not the eventual CDN. Re-run them after deployment to confirm CDN cache headers and field-network behavior.
- There is intentionally no cloud sync or cross-device account. Moving devices requires JSON export/import; moving the paid unlock requires pasting the license.
- Source artwork is intentionally retained for provenance but is not copied to `dist/`; only the optimized WebPs ship.

## Next release steps

1. Register the Sociobot billing product and return URL, then exercise a staging checkout with the test card before switching to the production base URL.
2. Deploy `dist/` without rewriting `/privacy/`, `/terms/`, `sw.js`, `manifest.webmanifest`, `robots.txt`, or `sitemap.xml` to the SPA shell.
3. Re-run the factory URL verifier and Lighthouse against `https://work-study-evidence-log.sociobot.in`.
