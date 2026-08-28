# Independent product verification — FAIL

**Work order:** `work-study-evidence-log-verify-2`
**Candidate:** `065e5e3293a331683aa361a37ffe73328acfc69e`
**Live URL:** <https://work-study-evidence-log.sociobot.in>
**Verified:** 2026-08-28 UTC
**Result:** **FAIL — do not release**

## Release decision

The deployed product is the candidate, not an old deployment: all 20 runtime files in local `dist/` matched their live responses byte-for-byte (including `index.html`, hashed JS/CSS, images, legal pages, manifest, and `sw.js`). However, the candidate's service worker precaches `/staticwebapp.config.json`; the live Static Web Apps host does not expose that deployment configuration as a public file and returns **404** for it. The install uses `Promise.all`, so that one non-OK response rejects the entire install.

In a fresh live Chromium context after six seconds:

```json
{
  "controller": false,
  "registrations": [],
  "cacheNames": ["practice-evidence-1.0.1-7G8j4IRo"]
}
```

`navigator.serviceWorker.ready` did not resolve within five seconds. An offline reload could therefore not complete. This disproves the prominent claim “The log reloads offline after the first visit” on the live product and fails the PWA-offline acceptance requirement. Local preview tests pass because Vite serves `dist/staticwebapp.config.json`, masking the deployment-only defect.

## Required gates first

### Claims gate — local PASS; live offline claim FAIL

`.factory/claims.json` is present with nine registered claims. From the clean checkout, after `npm ci`, I ran every exact command listed in the registry through the product's demo entry point:

| Claim | Exact command | Result |
| --- | --- | --- |
| `demo-isolation` | `npm run test:e2e -- --grep @claim:demo-isolation` | PASS |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS locally; **FAIL live** (service worker cannot install) |
| `portable-data` | `npm run test:e2e -- --grep @claim:portable-data` | PASS |
| `core-workflow` | `npm run test:e2e -- --grep @claim:core-workflow` | PASS |
| `license-check` | `npm run test:e2e -- --grep @claim:license-check` | PASS |
| `accessible-themes` | `npm run test:e2e -- --grep @claim:accessible-themes` | PASS |
| `update-notice` | `npm test -- --testNamePattern @claim:update-notice` | PASS |
| `local-privacy` | `npm run test:e2e -- --grep @claim:local-privacy` | PASS |
| `free-core-paid-review` | `npm run test:e2e -- --grep @claim:free-core-paid-review` | PASS |

The complete clean `npm run test:e2e` run also passed 11/11. The local claim is well-covered but cannot establish the host-specific service worker behavior; the fresh live browser evidence is controlling for release acceptance.

### Cold first read — PASS

A new browser context with no storage opened the live root directly. The first screen says:

- **What it does:** “Connect practice to where it helps.” It explains that the log connects a focused practice block to later work use.
- **For whom:** “working professionals who study around a job.”
- **What to click first:** the visible one-click **Try it with sample data** link, with the adjacent explanation that it opens a separate demo log and leaves the user's log untouched.

It also shows the required concise private/offline/price facts. `/demo` loaded realistic sample entries and the persistent “Demo — sample data, nothing is saved to your log” banner with **Reset demo** and **Start for real**.

## Clean-checkout quality gates

| Check | Result | Evidence |
| --- | --- | --- |
| Candidate identity | PASS | `git rev-parse HEAD` = `065e5e3293a331683aa361a37ffe73328acfc69e` |
| Install | PASS | `npm ci`: 58 packages, 0 vulnerabilities reported |
| Unit tests | PASS | `npm test`: 8/8 Vitest tests |
| Type check | PASS | `npm run check` (`tsc --noEmit`) |
| Lint gate | PASS | `npm run lint` (`tsc --noEmit`) |
| Production build | PASS | `npm run build` produced `dist/` |
| Integration/e2e | PASS | `npm run test:e2e`: 11/11 Playwright tests |
| Initial JS/CSS budgets | PASS | app JS 34,715 bytes raw / 11.41 KB gzip; CSS 18,004 bytes raw / 4.84 KB gzip |

The shipped hero variants are 80,852 bytes (desktop) and 29,088 bytes (mobile); no external fonts or scripts are loaded.

## Functional, privacy, accessibility, and deployment evidence

- Local e2e exercised valid 10- and 60-minute practice blocks, whitespace and 9-minute rejection, a pre-practice work-use date rejection, linking, editing while preserving the link, deletion confirmation, JSON/CSV export, restoration, and malformed-import recovery. All passed.
- On the live `/demo`, fresh sample data and isolated `demo:practice-evidence-log` storage appeared. A valid 10-minute record saved successfully. Normal demo use recorded 10 requests, all same-origin GETs; there were no console errors or page errors. The local full claim flow additionally proves the create-and-link request log is no cross-origin and no non-GET request.
- Live axe scans had no serious or critical findings in both light and dark themes. At 390 px there was no horizontal overflow and zero visible interactive targets below 43.5 px high. Keyboard Tab first reached the visible “Skip to evidence log” link with a solid focus outline.
- Local browser checks covered legal routes, 200%-equivalent narrow layout, dialogs, and keyboard navigation. The reduced-motion policy is implemented in the candidate CSS and covered by the product's accessibility configuration.
- Live response headers are sound: CSP restricts default/script/style/worker sources to self, allows only the stated Sociobot billing origins for connections, uses `frame-ancestors 'none'`, and includes `X-Frame-Options: DENY`, `nosniff`, strict referrer policy, permissions policy, and HSTS. `/does-not-exist` returns HTTP 404; the manifest is `application/manifest+json`; hashed JS has `Cache-Control: public, max-age=31536000, immutable`.
- Rate-limit verification against the documented product verification endpoint allowed 30 sequential requests from this client. Request 31 and requests through 45 returned HTTP 429 with `Retry-After` (3 seconds on the first 429, then 2 seconds). This requirement passes.
- No sign-in flow is present, so no identity-provider requirement applies.

## Findings by severity

### Release-blocking / critical

1. **V2-01 — Live service worker installation fails, so the offline-reload claim is false in production.** `dist/sw.js` and the live `/sw.js` both precache `/staticwebapp.config.json`; the live URL is HTTP 404. The install handler rejects on that failed fetch. Fresh live Chromium has no registration/controller and `navigator.serviceWorker.ready` does not resolve. This blocks the PWA's required offline reload and makes the claim test non-representative of the deployed host.

   **Repair direction:** exclude `staticwebapp.config.json` from the generated precache (it is deployment configuration, not a runtime public asset), deploy, then verify in a fresh live context that `navigator.serviceWorker.ready` resolves, a controller is present after reload, and `/demo` reloads while offline with its sample data.

## Deployment identity

Representative exact SHA-256 matches:

- `index.html`: `649609b3b18cc95194267aaec378917802bac252c0aae7d21eaecbac31f618bf`
- `assets/app-7G8j4IRo.js`: `ba74d6e16f3c8bbde110f216d23bbc806ac4d7b70ece8b759f4e8289c1ef150a`
- `assets/index-DwD2ws3R.css`: `02c514a944ebe61b4c8c69819a03a41d792fc706e1cc2dd02b72302505be85f1`
- `sw.js`: `d0c4c0f1ba4a2817957368d659a8d8e8567ced62981fdf420e0f8c1429e2f9c2`

All ordinary static runtime files matched. `staticwebapp.config.json` is intentionally consumed as deployment configuration and is not publicly served; its absence is exactly what makes the candidate's generated precache invalid on this host.
