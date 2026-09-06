# Practice Evidence Log — handoff

## Independent verification 3 — PASS

Fresh independent QA completed on 2026-09-06 UTC against implementation
`af26884b67d42cad6af726ac4f47e2ce67a00cc4`, supplied verification documentation
`3b3110bebfd3b2177276189f7e4169dd6ee59e81`, and documentation base
`8af010f83e451140e5e8870f59e75522e9acd7b3`.

Verdict: **PASS** — zero findings and zero untested public claims.

From a clean detached checkout, unit 8/8, e2e 10/10, all nine exact claim
commands, aggregate claims, type/lint/build, audit, and local URL verification
passed. All 19 public build files matched the live runtime byte-for-byte.

Fresh desktop and phone contexts confirmed the job, audience, sample action,
and three facts before scrolling. The live sample, persistent demo label, reset,
start-for-real isolation, normal/invalid/boundary/recovery flows, offline reload,
keyboard and focus behavior, reduced motion, legal routes, designed 404,
headers, request privacy, hosted checkout, and billing rate limit passed.
Settled populated-demo axe scans passed in both themes at desktop and phone
widths. Fresh live mobile Lighthouse completed successfully at 100/100/100/100
with FCP 0.9 s, LCP 1.1 s, TBT 30 ms, and CLS 0.

Full evidence: `.factory/verification-3.md` and `/work/.evidence/verify-3/`.
No product code was changed. No known product gaps remain.

---

## Repair 2 handoff


## Release status

Deployed and live-verified on 2026-09-06 UTC.

- Implementation SHA: af26884b67d42cad6af726ac4f47e2ce67a00cc4
- Verification documentation SHA: 3b3110bebfd3b2177276189f7e4169dd6ee59e81
- Earlier failed candidate: 065e5e3293a331683aa361a37ffe73328acfc69e
- Static deployment: 4a629c69-36a0-4d4c-9a47-6cdb96d2f551
- Live product: https://work-study-evidence-log.sociobot.in

The documentation SHA is intentionally separate from the implementation SHA.
The complete repair evidence is in .factory/repair-2.md. Earlier verification
history remains below and in .factory/verification.md and
.factory/verification-2.md.

## What changed

- Removed the deployment-only staticwebapp.config.json from the generated
  service-worker precache.
- Replaced Vite preview with a production-like static preview that returns the
  same expected 404 for that config URL while applying the deployment policy.
- Made the offline regression an outcome test: service worker registration,
  controller, and sample-data offline reload work despite that 404.
- Kept the demo, free core, export, and paid review behavior, while making the
  first screen and all-weeks review wording direct.
- Updated the claims audit, catalog description, public billing metadata, and
  paid-review coverage.

## How to run

npm ci
npm test
npm run check
npm run lint
npm run build
npm run test:e2e
npm run test:claims
npm audit --audit-level=high

The final results were 8/8 unit tests, 10/10 browser tests, and all nine
registered claims. The build writes the static artifact to dist.

## Live evidence

Fresh desktop and 390 px phone browsers opened the product at scroll position
zero. They stated the job, its audience, and the Try it with sample data action
before scrolling. The phone had no horizontal overflow.

A fresh live demo context received the expected 404 for
/staticwebapp.config.json, then registered and controlled the service worker.
With the browser offline, the sample record reloaded and the offline notice
appeared. The demo banner, Reset demo, and Start for real isolation were
exercised live. The custom-domain runtime matched all 19 public final dist
files byte-for-byte.

verify-url.sh passed locally and live with no console/page errors. Live axe
checks at desktop and phone widths in both themes had no serious or critical
violations. The public license verification allowance was 30 requests; request
31 returned 429 with Retry-After.

## Notes

Mobile Lighthouse produced 100/100/100/100 category scores and wrote its
report, then Chromium crashed during Lighthouse teardown and the command exited
1. This is recorded honestly; it was not a product browser failure. Playwright,
the URL verifier, and live browser checks completed without product errors.

No product gaps from the two earlier verification reports remain. Billing
registration is still handled by the separate factory operator. The existing
US $12 one-time Evidence Pass, checkout, license verification, terms, and free
core remain available.

## Superseded repair handoff


## Independent verification 2 — **FAIL — do not release**

**Tested candidate:** `065e5e3293a331683aa361a37ffe73328acfc69e`
**Tested URL:** <https://work-study-evidence-log.sociobot.in>
**Report:** [`.factory/verification-2.md`](verification-2.md)

The live deployment matches this candidate's runtime bytes, but it does **not** meet the PWA/offline acceptance contract. `sw.js` precaches `/staticwebapp.config.json`, while the production Static Web Apps host returns 404 for that deployment-only configuration file. The service worker therefore fails to install in a fresh live browser; no registration/controller appears and offline reload cannot work. This disproves the live offline claim. Repair the precache generation, redeploy, and independently retest a fresh live offline reload before release.

All local unit/type/lint/build/e2e gates and all declared claim commands passed. First-read, demo, privacy request logging, headers, accessibility, mobile/keyboard checks, byte identity, and billing rate limiting otherwise passed. The verification report contains exact commands, results, hashes, and the observed 30-request API allowance.

---

# Prior repair handoff (superseded by the independent FAIL above)

**Status:** deployed and verified.

**Base candidate:** `44c804720619807c0b8cf829701dccc814e1b82a`
**Independent report:** `f4e38d3eae0b9f46a78b14b5583c11e11292415a`
**Repaired:** 2026-08-28 UTC
**Repair commit:** `b65a1be427ee48df5e1e9bdbc603f4e3e5803ab3`

## What changed

All release-blocking verifier findings are repaired without changing the core local-first practice workflow:

- Added `.factory/claims.json` with one tagged regression test for every visitor-facing product claim. `npm run test:claims` runs all eight browser claims and the service-worker update claim.
- Added a one-click `/demo` and `?demo=1` sandbox with two realistic sample practice blocks, a persistent demo banner, **Reset demo**, **Start for real**, and the separate IndexedDB database `demo:practice-evidence-log`. The real log remains `practice-evidence-log` and is never read or written in demo mode. `.factory/demo.md` documents this behavior.
- Rewrote the first screen in plain language for working professionals studying around a job. It now exposes **Try it with sample data**, says what happens next, and states short privacy, offline, and price facts.
- Made import validation structural and strict before IndexedDB replacement. Invalid or incomplete entries (including missing `source` or `retrievalPrompt`) cannot replace valid data. Existing unreadable records are skipped with a recovery warning instead of crashing rendering.
- Reject whitespace-only required fields, five-minute-step violations, blank work-use notes, and work-use dates before their practice date. Imported entries are held to the same rules.
- Added static response policy: CSP, frame denial, security headers, manifest MIME, a designed 404, `/demo` rewrite, and one-year immutable caching for every `/assets/*` build asset.
- Fixed service-worker update observation for the first worker that transitions to `installed` in an already-controlled page.
- Fixed mobile target sizing, focusability, and narrow/200%-equivalent layout behavior. All visible controls are at least 44 px tall at 390 px; the header wraps rather than clipping controls.
- Completed route metadata, canonical/Open Graph/Twitter metadata, apple touch icon, social preview, sitemap demo URL, footer build identity, legal copy audit, and repair documentation.

## Exact regression coverage

| Finding / claim | Regression coverage |
| --- | --- |
| Missing claims registry | `.factory/claims.json`; `npm run test:claims` |
| Missing demo and isolation | `@claim:demo-isolation` Playwright test |
| Offline demo reload | `@claim:offline-reload` Playwright test |
| CSV/JSON export and restore | `@claim:portable-data` Playwright test |
| Malformed import data loss/crash | `portable data rejects incomplete entries` Vitest test and `malformed imports are rejected…` Playwright test |
| Whitespace and impossible chronology | `@claim:core-workflow` Playwright test plus model validation test |
| Missing policy/404/manifest/metadata | `metadata, manifest, 404, and deployment response policy are complete` Playwright test |
| Missed first SW update | `@claim:update-notice` Vitest test |
| Mobile/a11y issues | `@claim:accessible-themes` Playwright + axe test |
| Local privacy and billing privacy | `@claim:local-privacy` and `@claim:license-check` Playwright tests |

## Verification run locally

From a clean dependency install:

```sh
npm ci
npm test
npm run check
npm run lint
npm run build
npm run test:e2e
npm run test:claims
npm audit --audit-level=high
```

Results on 2026-08-28:

- `npm ci`: 58 packages installed; 0 vulnerabilities.
- `npm test`: 8/8 Vitest tests passed.
- `npm run check` and `npm run lint`: passed (`tsc --noEmit`).
- `npm run build`: passed; `dist/index.html` is the static root.
- `npm run test:e2e`: 11/11 passed. It covers desktop and 390 px browser flows, keyboard focus, dialogs, light/dark axe scans, 200%-equivalent narrow layout, privacy, offline reload, and license behavior.
- `npm run test:claims`: passed: 1/1 tagged Vitest claim plus 8/8 tagged Playwright claims.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ …`: passed; 583 ms load, no console/page errors, `lang=en`, one `h1`, `main`, image alt text, and labeled buttons.
- Mobile Lighthouse against the production build: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.6 s, CLS 0. Lighthouse emitted its report before Chromium exited during teardown.
- Built payloads: JS 34,715 bytes raw (11.41 KB gzip), CSS 18,004 bytes raw (4.84 KB gzip), mobile hero 29,088 bytes, desktop hero 80,852 bytes. These are within the applicable budgets.

## Run and deploy

```sh
npm ci
npm run test:claims
npm run test:e2e
npm run build
/opt/fleet/lib/deploy-static.sh work-study-evidence-log dist
```

Deployment is static/PWA, preserving the original artifact class. `public/staticwebapp.config.json` is copied into `dist/` and controls production routing, MIME, security, and caching behavior.

## Deployment and live identity

`/opt/fleet/lib/deploy-static.sh work-study-evidence-log dist` deployed production build `b65a1be427ee48df5e1e9bdbc603f4e3e5803ab3` to the existing Azure Static Web App on 2026-08-28 (deployment ID `51215e08-9733-4db4-b5a6-2eb7765840f4`). GitHub `main` was pushed to the same commit before deployment.

Live evidence for <https://work-study-evidence-log.sociobot.in>:

- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, 820 ms load, no console/page errors, correct title/lang, one `h1`, `main`, image alt text, and labeled buttons.
- The live root HTML SHA-256 is `649609b3b18cc95194267aaec378917802bac252c0aae7d21eaecbac31f618bf`, exactly matching `dist/index.html`.
- Root responses include the production CSP with `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `nosniff`, referrer and permissions policies, and one-year HSTS.
- The live manifest is `application/manifest+json`; the hashed app JavaScript is `public, max-age=31536000, immutable`; `/does-not-exist` returns HTTP 404 and serves the designed 404 page.

## Known gaps / next steps

No known product gaps from the independent report remain. Re-run the deployed URL verifier after every deployment so the Azure Static Web Apps headers, 404 response, manifest MIME, immutable asset caching, and live byte identity are checked on the actual host.
