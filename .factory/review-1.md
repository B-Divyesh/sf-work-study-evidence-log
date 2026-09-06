# Link practice to later work use — strict review 1

**Verdict: PASS**

- Work order: `work-study-evidence-log-review-1`
- Live URL: <https://work-study-evidence-log.sociobot.in>
- Implementation reviewed: `af26884b67d42cad6af726ac4f47e2ce67a00cc4`
- Documentation base at review start: `a642f2b0cf8632e55f8d67237273a1dfaa66200a`
- Reviewed: 2026-09-06 UTC
- Findings: **0**
- Untested public claims: **0**

The live product and a clean detached checkout pass this strict review. No
product code was modified. The expected HTTP 404 for
`/staticwebapp.config.json` is deployment behavior, not a defect. The worker
did not contain the separately named
`factory-evidence/work-study-evidence-log-verify-3/qa-report.md` path. The full
repository copy at `.factory/verification-3.md` was present and read before
testing, together with every earlier verification and repair report.

Evidence for this review is under `/work/.evidence/review-1/`.

## First screen before scrolling

Fresh 1440×900 desktop and 390×844 phone contexts opened the live root at
`scrollY = 0`.

- Job: **“Link practice to later work use.”**
- Audience: working professionals who study around a job in 10–60 minute
  blocks.
- First action: **“Try it with sample data.”**
- The separate-demo explanation and the private, offline, and US $12-once facts
  were visible before scrolling.
- The phone had no horizontal overflow, clipping, overlap, or hidden first
  action.

Screenshots:
`/work/.evidence/review-1/live-desktop-first-screen.png` and
`/work/.evidence/review-1/live-phone-first-screen.png`.

## Clean checkout and quality gates

A detached worktree was created at the implementation commit before installing
the documented Node dependencies. No claim command was attempted before
`npm ci`.

| Gate | Result |
| --- | --- |
| `npm ci` | PASS — 58 packages, zero vulnerabilities |
| `npm test` | PASS — 8/8 |
| `npm run check` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — `dist/index.html` produced |
| `npm run test:e2e` | PASS — 10/10 |
| `npm run test:claims` | PASS — 1 tagged unit test and 8 tagged browser tests |
| `npm audit --audit-level=high` | PASS — zero vulnerabilities |
| local `verify-url.sh` | PASS — 586 ms, no console or page errors |
| live `verify-url.sh` | PASS — 614 ms, no console or page errors |

The final build contains 34,673 bytes of JavaScript, 18,004 bytes of CSS, and
29,088/80,852-byte phone/desktop hero WebPs. These are within the static PWA
budgets. There are no runtime webfonts, third-party scripts, or analytics.

## Every declared claim

Each exact command in `.factory/claims.json` was run separately from the clean
checkout. Each claim tag occurs exactly once in the tests.

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

Landing, application, README, privacy, and terms copy were cross-checked with
the registry. Demo isolation, local storage, offline reload, export and restore,
validation, license-request privacy, themes and access, update notice, local
request privacy, free core features, and the paid review all map to passing
tests. Live checkout, invalid-license, and rate-limit checks cover the public
billing statements. No missing, false, incomplete, or untested public claim was
found.

## Demo and main workflow

The live one-click sample opened two realistic records: “Reading retry
signals” and “Comparing query plans.” The first has a linked use note and the
second has an open question. The label **“Demo — sample data, nothing is saved
to your log.”** remained present with **Reset demo** and **Start for real**.

A disposable regular profile record did not appear in the demo. A demo-only
record disappeared after the reset settled, both original records returned,
and **Start for real** removed `demo:practice-evidence-log` while preserving the
regular `practice-evidence-log` record. No existing user profile or data was
read.

Fresh live use also passed:

- empty state, create, refresh persistence, and the valid 10- and 60-minute
  boundaries;
- rejection of whitespace-only fields and 9, 11, and 61 minutes;
- rejection of a blank work-use note and a work-use date before practice;
- same-day linking, editing with the link preserved, cancel delete, and
  confirmed delete;
- JSON and CSV export containing every record, followed by valid JSON restore;
- structurally incomplete import rejection, preservation of the prior record,
  and an error-free reload.

Two initial diagnostic probes advanced before asynchronous reset/import work
had replaced already-visible content. They were not treated as product results.
Explicit settled-state reruns passed: reset completed in 77 ms; valid restore
removed the added record; malformed import showed the expected validation
message, kept the baseline record, and reloaded without a page error.

## Privacy, offline use, and updates

The normal live create, link, export, reset, and restore paths made same-origin
GET requests only. No record text left the origin, and there were no analytics
requests. A live invalid-license action made one GET to the documented Sociobot
verification route. Its only query key was `license`; it had no request body or
log text, and the paid review stayed locked.

A fresh live `/demo` context obtained one service-worker registration and a
controller using cache `practice-evidence-1.0.1-CENH-XxG`. After the browser was
set offline, reload retained both sample records and showed **“Offline — local
logging and export still work.”** The generated and live workers omit
`staticwebapp.config.json`. The host deliberately returns HTTP 404 for that
deployment-only path.

The exact tagged unit test proved that an open page reports the first newly
installed service worker. It passed separately and through the aggregate claim
gate.

## Accessibility and mobile behavior

Settled Playwright axe scans found zero serious or critical violations on the
populated demo at 1280 px and 390 px in light and dark themes. Phone scans of
the root, privacy, terms, and designed 404 also found zero serious or critical
violations.

Keyboard Tab first reached the visible skip link with a 3 px solid focus ring.
The practice dialog had an accessible name, moved focus to its first field, and
returned focus to the opener on Escape. No visible 390 px interactive target
was under 43.5 px. A 195 px viewport, representing 200% reflow, had no
horizontal overflow. Reduced motion set animation and transition durations to
0.01 ms and document scrolling to `auto`.

## Routes, links, policy, and legal pages

| Route | HTTP | Title | Structure |
| --- | ---: | --- | --- |
| `/` | 200 | `Practice Evidence Log — Link practice to work` | one `h1`, one `main`, `lang=en` |
| `/demo` | 200 | `Demo — Practice Evidence Log` | one `h1`, one `main`, `lang=en` |
| `/privacy/` | 200 | `Privacy — Practice Evidence Log` | one `h1`, one `main`, `lang=en` |
| `/terms/` | 200 | `Terms — Practice Evidence Log` | one `h1`, one `main`, `lang=en` |
| `/does-not-exist` | 404 | `Page not found — Practice Evidence Log` | one `h1`, one `main`, `lang=en` |

All ordinary same-origin links discovered across these pages returned 200.
Mail links are explicit. The missing-page document correctly returns 404 and
offers working links home and to the demo. Chromium reports the expected failed
document request for that deliberate 404; the page itself is complete and this
is not a defect.

Root, manifest, hashed assets, worker, and 404 responses carry the declared
CSP, `frame-ancestors 'none'`, frame denial, `nosniff`, referrer, permissions,
and HSTS policies. The manifest is `application/manifest+json`. The hashed app
script is immutable for one year, while `sw.js` is not cached. Manifest icons,
standalone display, versioned start URL, and palette colors are present.

## Paid review and request allowance

The checkout route returned HTTP 303 to the hosted Dodo checkout. A new invalid
license returned `{ valid: false, reason: "invalid" }`. The verification route
allowed 30 sequential requests; request 31 returned 429, and the response
included `Retry-After: 4`. The free logging and export paths stayed available
without a license.

This is a static local-first PWA, not a product backend. Tenant isolation,
server restart, SQLite persistence, and a product health endpoint therefore do
not apply. Only this product's public billing routes were checked.

## Runtime identity and performance

All 19 public build files from implementation
`af26884b67d42cad6af726ac4f47e2ce67a00cc4` matched the live responses
byte-for-byte. The later commits through the documentation base change only
factory reports and handoff text, so they do not require a different product
image. The deployment configuration file is correctly excluded from the
public-file comparison.

The first Lighthouse attempt ended with a Chromium tab crash and produced no
report. A retry with conservative headless flags exited successfully and wrote
`/work/.evidence/review-1/lighthouse-live-retry.json`:

| Category or metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| First Contentful Paint | 1.0 s |
| Largest Contentful Paint | 1.1 s |
| Total Blocking Time | 10 ms |
| Cumulative Layout Shift | 0 |

INP is not available from a navigation-only lab run. The tested interaction
paths responded without observable delay, and no public INP claim is made.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| V-01 claim registry missing | Resolved: nine claims are registered, each tag occurs once, and every exact command passed. |
| V-02 sample demo missing | Resolved: live one-click sample, realistic records, label, reset, separate storage, and start-for-real passed. |
| V-03 audience and facts missing | Resolved before scrolling in fresh desktop and phone contexts. |
| V-04 malformed import data loss | Resolved: incomplete import was rejected, prior data remained, and reload had no error. |
| V-05 whitespace accepted | Resolved: live required fields rejected spaces with a useful message. |
| V-06 impossible dates accepted | Resolved: live work use before practice was rejected. |
| V-07 response policy and 404 | Resolved: live security headers and designed 404 passed. |
| V-08 immutable assets | Resolved: live hashed JavaScript has one-year immutable caching. |
| V-09 update notice missed | Resolved: the exact update-event claim test passed. |
| V-10 mobile access | Resolved: phone layout, targets, keyboard, focus, axe, and 200% reflow passed. |
| V-11 metadata and route identity | Resolved: route titles, canonical/social/touch metadata, and footer build identity are present. |
| V-12 copy and demo documentation | Resolved: current demo and copy-audit documents meet the attached contracts. |
| V-13 manifest MIME | Resolved: live response is `application/manifest+json`. |
| V2-01 production worker install | Resolved: a fresh live worker controlled the page and reloaded the populated demo offline. |

The visual system is product-specific and documented, including the original
ceramic asset's prompt and provenance. The brief does not imply an AI-assisted
step. This job depends on private manual evidence capture; adding model traffic
would weaken the stated local-first and offline constraints. There is no missed
AI feature finding.

## Decision

**PASS.** There are zero findings of every severity and zero untested public
claims. No product code was changed during this review.
