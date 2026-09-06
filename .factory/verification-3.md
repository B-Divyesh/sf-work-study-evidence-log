# Link practice to later work use — independent verification 3

**Verdict: PASS**

- Work order: `work-study-evidence-log-verify-3`
- Live URL: <https://work-study-evidence-log.sociobot.in>
- Implementation reviewed: `af26884b67d42cad6af726ac4f47e2ce67a00cc4`
- Supplied verification documentation: `3b3110bebfd3b2177276189f7e4169dd6ee59e81`
- Documentation base at review start: `8af010f83e451140e5e8870f59e75522e9acd7b3`
- Verified: 2026-09-06 UTC
- Findings: **0**
- Untested public claims: **0**

The implementation passes independent clean-checkout and live verification. The
expected HTTP 404 for `/staticwebapp.config.json` is deployment behavior, not a
defect. The service worker does not request that file and the populated demo
reloads offline in a fresh live browser.

## First screen before scrolling

Fresh 1440×900 desktop and 390×844 phone contexts opened the live root at
`scrollY = 0`.

- Job: **“Link practice to later work use.”**
- Audience: working professionals who study around a job in 10–60 minute blocks.
- First action: **“Try it with sample data.”**
- The separate-demo explanation and the private, offline, and price facts were
  visible before scrolling.
- The phone had no horizontal overflow. Visual inspection found no clipping,
  overlap, or unclear primary action.

Screenshots: `/work/.evidence/verify-3/live-desktop-first-screen.png` and
`/work/.evidence/verify-3/live-phone-first-screen.png`.

## Clean checkout and declared commands

A detached worktree was created at the implementation SHA. `npm ci` installed
58 packages and reported zero vulnerabilities. A first claim invocation made
before dependencies were installed in that detached worktree stopped at
`vite: not found`; no product test ran. After the documented prerequisite was
installed in the correct worktree, that exact command and every other command
below were rerun and passed.

| Gate | Result |
| --- | --- |
| `npm test` | PASS — 8/8 |
| `npm run check` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — `dist/index.html` produced |
| `npm run test:e2e` | PASS — 10/10 |
| `npm run test:claims` | PASS — 1 tagged unit test and 8 tagged browser tests |
| `npm audit --audit-level=high` | PASS — zero vulnerabilities |
| local `verify-url.sh` | PASS — 587 ms, no console/page errors |
| live `verify-url.sh` | PASS — 694 ms, no console/page errors |

The final build contains 34.67 KB raw JavaScript (11.32 KB gzip) and 18.00 KB
raw CSS (4.84 KB gzip). The desktop/mobile hero WebPs are 80,852 and 29,088
bytes. There are no runtime webfonts, CDN scripts, or analytics.

## Every registered claim

Each exact command in `.factory/claims.json` was run separately after the clean
install. Evidence logs are under `/work/.evidence/verify-3/claim-*.log`.

| Claim | Exact command | Result |
| --- | --- | --- |
| `demo-isolation` | `npm run test:e2e -- --grep @claim:demo-isolation` | PASS — 1/1 |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS — 1/1 |
| `portable-data` | `npm run test:e2e -- --grep @claim:portable-data` | PASS — 1/1 |
| `core-workflow` | `npm run test:e2e -- --grep @claim:core-workflow` | PASS — 1/1 |
| `license-check` | `npm run test:e2e -- --grep @claim:license-check` | PASS — 1/1 |
| `accessible-themes` | `npm run test:e2e -- --grep @claim:accessible-themes` | PASS — 1/1 |
| `update-notice` | `npm test -- --testNamePattern @claim:update-notice` | PASS — 1/1 |
| `local-privacy` | `npm run test:e2e -- --grep @claim:local-privacy` | PASS — 1/1 |
| `free-core-paid-review` | `npm run test:e2e -- --grep @claim:free-core-paid-review` | PASS — 1/1 |

Landing, application, README, privacy, and terms copy were cross-checked against
the registry. Demo isolation, storage, offline use, export/restore, validation,
license requests, themes/access, updates, privacy, free features, and paid-review
statements all map to passing tests. Live checkout and invalid-license checks
also prove the payment statements. No missing, false, incomplete, or untested
public claim remains.

## Live product exercise

The one-click sample opened two realistic records: “Reading retry signals” and
“Comparing query plans.” The persistent banner read “Demo — sample data,
nothing is saved to your log.” A temporary sample record disappeared after
**Reset demo**. **Start for real** deleted `demo:practice-evidence-log`, returned
to the separate regular database, and preserved the regular test record. All
browser profiles were disposable; no existing user data was read or changed.

The live paths passed:

- Empty state, create, refresh persistence, 10- and 60-minute boundaries,
  linking a same-day work-use note, edit with the link preserved, cancel delete,
  confirmed delete, JSON/CSV export, and valid restore.
- Whitespace-only required fields; 9, 11, and 61 minutes; blank application
  text; and a work-use date before practice were rejected with useful messages.
- A structurally incomplete import was rejected, kept the sample data, and did
  not cause a page or console error after reload.
- Normal create/link/demo/reset use made 16 same-origin GET requests, no writes,
  and no cross-origin request. A live invalid-license check made one GET to the
  documented Sociobot endpoint containing only the test token; the paid review
  stayed locked and no log text appeared in the request.
- The checkout endpoint returned 303 to the hosted Dodo checkout. The license
  endpoint allowed 30 sequential requests; request 31 returned 429. A repeated
  limited request included `Retry-After: 4`.

This is a static local-first PWA with IndexedDB, not a product backend. Tenant,
server restart, SQLite persistence, and product health-endpoint checks therefore
do not apply. The separate Sociobot billing endpoint was checked only through
this product's public routes.

## Offline, routes, accessibility, and privacy

A fresh live `/demo` context obtained one service-worker registration and a
controller using cache `practice-evidence-1.0.1-CENH-XxG`. With the browser set
offline, reload retained the sample records and showed “Offline — local logging
and export still work.” Both built and live `sw.js` omit
`staticwebapp.config.json`; requesting that deployment-only URL returns the
expected designed HTTP 404.

Root, demo, privacy, terms, and missing-page routes returned 200, 200, 200, 200,
and 404 with their route-specific titles, one `h1`, and one `main`. Every
same-origin link discovered on the root returned 200. Mail links were explicit,
and the checkout link was separately verified. The designed 404 offers working
routes home and to the demo.

Settled-state Playwright axe scans found zero serious or critical violations on
the populated demo at 1280 px and 390 px in light and dark themes, and on the
root, privacy, terms, and 404 pages. The scan waits beyond the documented 240 ms
entry/theme transition so it measures the resting interface rather than a
partly transparent animation frame.

Keyboard Tab first reached the visible skip link with a 3 px solid focus ring.
The practice dialog received focus, Escape returned focus to its opener, and
the dialog had an accessible name. No visible 390 px target was under 43.5 px.
A 195 px viewport, representing 200% reflow, had no horizontal overflow.
Reduced motion changed animation duration to 0.01 ms and scrolling to `auto`.

The live root, manifest, hashed assets, worker, and 404 responses had the
declared CSP, frame denial, `nosniff`, referrer, permissions, and HSTS policies.
The manifest used `application/manifest+json`; the hashed application script
was immutable for one year; `sw.js` was not cached.

## Runtime identity and performance

All 19 public files from the implementation build matched the live responses
byte-for-byte. `staticwebapp.config.json` was correctly excluded because the
host consumes it as deployment configuration. The complete comparison is in
`/work/.evidence/verify-3/byte-identity.tsv`.

Fresh live mobile Lighthouse completed with:

| Category or metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| First Contentful Paint | 0.9 s |
| Largest Contentful Paint | 1.1 s |
| Total Blocking Time | 30 ms |
| Cumulative Layout Shift | 0 |

The command exited successfully and wrote
`/work/.evidence/verify-3/lighthouse-live.json`.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| V-01 claim registry missing | Resolved: nine registered claims; every exact command passed. |
| V-02 sample demo missing | Resolved: one-click live demo, realistic data, persistent label, reset, and separate storage passed. |
| V-03 audience/facts missing | Resolved on fresh desktop and phone before scrolling. |
| V-04 malformed import data loss | Resolved: live malformed import preserved data and survived reload. |
| V-05 whitespace accepted | Resolved: live required fields reject spaces. |
| V-06 impossible dates accepted | Resolved: live earlier use date rejected. |
| V-07 response policy/404 | Resolved: headers and designed 404 verified live. |
| V-08 immutable assets | Resolved: hashed asset has one-year immutable caching. |
| V-09 update notice missed | Resolved: exact tagged update-event test passed. |
| V-10 mobile access | Resolved: targets, keyboard, focus, phone layout, and 200% reflow passed. |
| V-11 metadata/route identity | Resolved: titles, canonical/social/touch metadata, and footer version are present. |
| V-12 copy/demo docs | Resolved: current demo and copy audit documents pass the attached contracts. |
| V-13 manifest MIME | Resolved: live `application/manifest+json`. |
| V2-01 production worker install | Resolved: fresh live registration/control and offline demo reload passed with the config URL unavailable. |

The design is product-specific, documented, and visually consistent with the
original ceramic asset and provenance. The brief does not imply an AI step: the
core job is private manual evidence capture, and adding model traffic would work
against local-first privacy and offline use. This is not a missed feature.

## Decision

**PASS.** There are zero findings of every severity and zero untested claims.
No product code was modified during this verification.
