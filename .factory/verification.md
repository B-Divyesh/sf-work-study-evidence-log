# Independent product verification — FAIL

**Work order:** `work-study-evidence-log-verify-1`

**Candidate:** `44c804720619807c0b8cf829701dccc814e1b82a`

**Live URL:** <https://work-study-evidence-log.sociobot.in>

**Verified:** 2026-08-28 UTC

**Result:** **FAIL — do not release**

This is not a deployment-only failure. Every file in the candidate's generated `dist/` matched the corresponding live response byte-for-byte, including HTML, hashed JS/CSS, images, legal pages, manifest, and service worker. The live product fails mandatory claims, demo, first-read, recovery, and site-policy requirements.

## Mandatory gates run first

### Claims gate — FAIL

`.factory/claims.json` is missing from the clean candidate checkout. There were therefore no claim commands to run through the required demo entry point. The contract explicitly makes a missing claims file release-blocking.

The product and README nevertheless make unlisted claims, including:

- records/evidence stay on the device;
- normal logging sends no data away;
- JSON and CSV export work;
- the application works/reloads offline;
- there is no account or analytics.

Existing repository tests are not tagged one-to-one as `@claim:<id>` and do not cure the missing registry.

### Cold first-read — FAIL

Observed cold on desktop 1440×900 and mobile 390×844:

- What it appears to do: save a focused practice prompt and later connect it to a situation where it helped.
- For whom: the first screen does not say. It never names working professionals or people studying around a job.
- What to click first: `Log practice` is apparent.

The first screen also lacks the required three concise facts covering privacy, offline behavior, and price. Most importantly, there is no `Try it with sample data` action. Both `/demo` and `/?demo=1` return the ordinary empty application: no sample records, no demo banner, no reset/start-for-real controls, and no separate demo storage namespace. `.factory/demo.md` is also missing.

## Clean-clone engineering gates

| Check | Result | Evidence |
| --- | --- | --- |
| Candidate identity | PASS | `git rev-parse HEAD` → `44c804720619807c0b8cf829701dccc814e1b82a` |
| `npm ci` | PASS | 58 packages installed; 0 vulnerabilities |
| `npm test` | PASS | Vitest: 4/4 |
| `npm run check` | PASS | TypeScript completed with no errors |
| `npm run build` | PASS | `dist/` produced |
| `npm run test:e2e` | PASS | Playwright: 4/4 |
| `npm audit --audit-level=high` | PASS | 0 vulnerabilities |
| Live URL verifier | PASS | HTTP 200; title/lang/one h1/main/alt/button labels; 0 load errors; 1272 ms |

There is no lint script in `package.json`.

Production payloads are within budget: JS 29,135 bytes raw / 9,620 gzip; CSS 17,182 raw / 4,754 gzip; desktop hero 80,852 bytes; mobile hero 29,088 bytes; no webfonts. Live mobile Lighthouse scored Performance 98, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 180 ms, CLS 0.

## End-to-end product exercise

Passing behavior:

- Created records at the valid 10- and 60-minute boundaries.
- Browser validation rejected 9, 61, and the off-step value 11 with an actionable native message.
- Added a realistic work-use note, edited its practice record without losing the note, refreshed, and retained data in IndexedDB.
- JSON export contained both records. CSV contained its header and one row per unlinked record/application.
- A valid version-1 JSON import replaced the current log and survived reload.
- Invalid JSON syntax showed an error and preserved the existing record.
- Delete confirmation named the record and linked-note count; confirmed deletion worked.
- Normal logging/linking made only same-origin requests. No analytics, CDN fonts, third-party scripts, or record-content requests were observed.
- After one online visit, the live product reloaded offline with saved data and showed the offline status.
- Checkout returned HTTP 303 to hosted Dodo checkout. License verification returned the expected invalid verdict for a bogus token.
- API rate limit passed: after one initial verification request, a 100-request concurrent burst returned 29 HTTP 200 and 71 HTTP 429 responses. The observed allowance was 29 additional requests in that burst (approximately a 30-request window); `Retry-After: 3` was present on 429 responses.

## Findings by severity

### Release-blocking / critical

1. **V-01 — Required claim registry and claim tests are absent.** `.factory/claims.json` does not exist. Claim-like landing, legal, and README copy is therefore unregistered and unproved through the required demo sandbox.
2. **V-02 — Required one-click sample demo is absent.** There is no sample-data action, demo mode, banner, reset, start-for-real path, isolated namespace, or `.factory/demo.md`. `/demo` silently serves the ordinary empty app.
3. **V-03 — Cold first screen does not identify the audience.** It explains the transfer concept and exposes `Log practice`, but does not say it is for working professionals studying around a job. It also omits the required offline and price facts from the first screen.
4. **V-04 — A malformed import can replace valid data and persistently break the app.** A version-1 bundle containing the superficially accepted fields but omitting `source`/`retrievalPrompt` passes `validateBundle`, clears and replaces IndexedDB, then throws `TypeError: Cannot read properties of undefined (reading 'replace')`. Reload repeats the error and leaves “Opening your local shelf…” stuck. Because replacement happens before rendering fails, the prior log is lost without an in-product recovery path.

### High

5. **V-05 — Required-field validation accepts whitespace-only content.** Spaces satisfy native `required`; the app trims them only after validation and saves a visually blank topic, source, and retrieval prompt.
6. **V-06 — Chronologically impossible transfer evidence is accepted.** A work-use note dated 2026-08-19 was accepted for practice dated 2026-08-20, despite the product's defining promise that use happens later.
7. **V-07 — Production response policy is incomplete.** Pages have HSTS, `nosniff`, and a referrer policy, but no Content-Security-Policy and no frame restriction. `/does-not-exist` returns HTTP 200 with the home app; there is no designed 404. `staticwebapp.config.json` is absent.
8. **V-08 — Immutable caching is not configured for hashed assets.** Live hashed JS and CSS return `cache-control: public, must-revalidate, max-age=30`, not a long-lived immutable policy. `sw.js` correctly uses the short policy, but hashed assets should not.

### Medium

9. **V-09 — The in-app service-worker update notification misses the initial update event.** In a controlled two-version test, a new worker reached `waiting: installed` while the toast remained hidden. Reloading the page then exposed “An update is ready,” and `Use it now` activated it. Users are not notified until another navigation/reload.
10. **V-10 — Mobile accessibility details miss the contract.** At 390 px, the header's visually clipped `Evidence` link remains keyboard-focusable at 1×1 px. The brand link is 34 px tall, theme select 36 px, and footer Privacy/Terms links 22 px, below the 44 px touch-target minimum. Simulated 200% zoom produced 640 px content width in a 390 px viewport and horizontal scrolling.
11. **V-11 — Required page metadata and route identity are incomplete.** The home title is only `Practice Evidence Log`, not “Product — what it does.” Canonical, Open Graph, Twitter card, and apple-touch metadata are absent. The footer lacks a build/version identifier and the prescribed “Built by Param Factory” treatment.
12. **V-12 — Required copy/demo documentation is absent.** `.factory/copy-audit.md` is missing as well as `.factory/demo.md`. Several legal-page sentences exceed the attached 22-word plain-language cap.
13. **V-13 — Manifest MIME is generic.** The live manifest parses successfully in Chromium but is served as `application/octet-stream` rather than `application/manifest+json`.

## Accessibility and browser evidence

- Axe serious/critical findings: 0 in light and dark at desktop and 390 px; 0 on `/privacy/` and `/terms/`.
- Semantic smoke test: `lang=en`, one home `h1`, one `main`, meaningful image alt, labeled buttons, skip link.
- Keyboard-only clean pass reached all visible desktop controls; focus uses a 3 px cobalt outline, dialogs receive focus and Escape returns focus to the opener.
- Reduced motion matched and reduced dialog animation to 0.01 ms; smooth scrolling became `auto`.
- No console or page errors occurred on clean root/legal loads. The malformed-import case reliably generated the page error described in V-04.
- No desktop or baseline 390 px horizontal overflow occurred before zoom.

## Deployment identity

All 15 generated files matched live bytes. Representative SHA-256 values:

- `index.html`: `3672d7b0633fc5b38d9bfc06d5c33e00c2fcf4d52e08ee22071d306725e3e71f`
- `assets/app-BLlbHi18.js`: `aebcaddea81b7f58898f84c6a6ed2272043bcd4dfe5cb9d694bf7b9454e4adc3`
- `assets/index-DKYl72iy.css`: `941b2a458085ffe95a8e8a3e43403bde55a9fff594c70cdf1d6e9b2d318ce444`
- `sw.js`: `0ceb42746c2cbab17c63941e062ccbd585285fbe04a62faef6f88d20316661eb`

## Release decision

**FAIL.** Do not release candidate `44c804720619807c0b8cf829701dccc814e1b82a`. The deployed bytes are current and much of the core local-first loop works, but the explicit claims/demo/first-read gates fail and malformed import can destroy the current log and strand the app in a recurring runtime failure.
