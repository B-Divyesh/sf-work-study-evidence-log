# Practice Evidence Log — repair handoff

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
