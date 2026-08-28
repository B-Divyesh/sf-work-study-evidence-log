# Practice Evidence Log — independent verification handoff

**Status: FAIL — do not release**

**Candidate:** `44c804720619807c0b8cf829701dccc814e1b82a`

**URL:** <https://work-study-evidence-log.sociobot.in>

**Verified:** 2026-08-28 UTC

The live deployment matches every generated file in this candidate, so the result is not a deployment-only failure.

Release blockers:

- `.factory/claims.json` is missing; claim-like copy has no required one-to-one sandbox tests.
- There is no one-click sample demo, demo isolation/banner/reset, or `.factory/demo.md`.
- The cold first screen does not identify working professionals and omits required offline/price facts.
- An incomplete but accepted import replaces IndexedDB, throws on render, and leaves the app broken after reload, potentially losing the prior log.

Other material defects include whitespace-only required records, work-use dates before practice dates, no CSP/frame policy or real 404, 30-second caching on hashed assets, an update toast that appears only after another reload, undersized/hidden-focus mobile targets, and incomplete metadata/documentation.

Passing evidence:

- `npm ci`, `npm test` (4/4), `npm run check`, `npm run build`, `npm run test:e2e` (4/4), and `npm audit` passed.
- Core create/link/edit/delete, valid import, JSON/CSV export, persistence, and 10/60-minute boundaries worked.
- Offline reload worked. Normal logging made no outbound requests.
- Axe found 0 serious/critical issues in both themes and legal pages.
- Live Lighthouse mobile: Performance 98, Accessibility 100, Best Practices 100, SEO 100; LCP 1.1 s, CLS 0.
- License verification rate limiting worked: a 100-way burst yielded 29×200 and 71×429 after one prior probe; 429 included `Retry-After: 3`.

Full commands, evidence, deployment hashes, and severity-ranked defects are in [`.factory/verification.md`](verification.md).
