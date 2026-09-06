# Repair 2 — production offline verification

Implementation candidate: af26884b67d42cad6af726ac4f47e2ce67a00cc4
Failed base: 065e5e3293a331683aa361a37ffe73328acfc69e
Live URL: https://work-study-evidence-log.sociobot.in
Deployment: 2026-09-06 UTC, Static Web Apps deployment 4a629c69-36a0-4d4c-9a47-6cdb96d2f551

## Repair

The service-worker generator previously collected every file in dist, including
staticwebapp.config.json. Azure Static Web Apps consumes that file at deployment
time and returns 404 to browser requests. Because installation used Promise.all,
that expected 404 rejected the worker installation.

The generator now excludes the deployment-only configuration file. The preview
server applies the deployment policy but returns 404 for that URL, so the
offline browser claim proves the observable production condition: a sample log
reloads offline while the configuration URL is unavailable. It does not assert
generated source text.

The first screen and paid review copy were also made direct. It states the job,
audience, first action, and one-time paid review without mood wording.
.factory/catalog-description.txt contains the matching verb-first catalog
description. Public one-time offer metadata is at
/work/.evidence/billing-offer.json; billing registration remains a separate
factory operation.

## Clean setup and local checks

npm ci installed 58 packages with zero vulnerabilities. The following all passed:

| Check | Result |
| --- | --- |
| npm test | 8/8 Vitest tests |
| npm run check and npm run lint | passed |
| npm run build | passed; dist/index.html exists |
| npm run test:e2e | 10/10 Playwright tests |
| npm run test:claims | 1/1 tagged Vitest plus 8/8 tagged Playwright claims |
| npm audit --audit-level=high | zero vulnerabilities |
| Local verify-url.sh | 584 ms; no errors; title/lang/one h1/main/alts/button labels passed |

Every exact claim command in .factory/claims.json was run. This includes
host-faithful offline reload, demo isolation, export/import, invalid and
boundary validation, privacy request logging, themes/keyboard/mobile/axe,
license request privacy, paid review behavior, and the update notice.

The final payload is 34,671 bytes raw JavaScript (11.32 KB gzip), 18,004 bytes
raw CSS (4.84 KB gzip), and 80,852/29,088-byte desktop/mobile hero WebPs. There
are no webfonts, CDN scripts, or analytics requests.

Mobile Lighthouse generated a final-build report with Performance 100,
Accessibility 100, Best Practices 100, and SEO 100; FCP 1.2 s, LCP 1.7 s, CLS
0, and TBT 40 ms. It wrote the report, then Chromium crashed during teardown
and Lighthouse exited 1. This tooling outcome is recorded, not presented as a
passing Lighthouse process exit; product browser and Playwright checks passed.

## Final live checks

- verify-url.sh passed in 738 ms with no console/page errors.
- Fresh desktop at scroll position zero stated the job “Link practice to later
  work use.”, its audience, and “Try it with sample data.” first.
- Fresh 390 px phone had no horizontal overflow and showed the first action
  before scrolling. Screenshots are in /work/.evidence/.
- The live one-click demo had its persistent label and realistic entries. Reset
  removed a temporary demo record and restored the sample. Start for real
  removed the demo database and restored the separate real record.
- A fresh /demo context received the expected config 404 but had one worker
  registration and controller using practice-evidence-1.0.1-CENH-XxG. Offline
  reload showed the sample entry and offline notice without errors.
- All 19 public final dist files matched live byte-for-byte. The deployment
  config is deliberately excluded and returns 404. The designed missing route
  is 404, the manifest has the correct MIME, hashed assets are immutable, and
  CSP/frame/contents/referrer/HSTS headers are present.
- Live axe scans at desktop and 390 px in light and dark themes had zero
  serious or critical violations.
- License verification allowed 30 sequential requests; request 31 returned 429
  with Retry-After: 4.

## Earlier findings

| Finding | Current disposition |
| --- | --- |
| V-01 claims | Registry and every claim command pass. |
| V-02 demo | Live separate namespace, banner, reset, and start-for-real isolation pass. |
| V-03 first read | Live desktop and phone check passes before scrolling. |
| V-04 import recovery | Unit and browser checks prevent invalid replacement. |
| V-05 whitespace | Core workflow rejects whitespace-only required fields. |
| V-06 dates | Core workflow rejects work use before practice. |
| V-07 headers/404 | Local and live response checks pass. |
| V-08 immutable assets | Local and live cache checks pass. |
| V-09 update notice | Tagged unit claim passes. |
| V-10 mobile access | Accessibility claim, live phone review, keyboard checks, and axe pass. |
| V-11 metadata | Browser and live title checks pass. |
| V-12 copy/demo docs | Demo and copy audit are current; direct copy replaces mood wording. |
| V-13 manifest MIME | Live application/manifest+json. |
| V2-01 worker install | Fixed; fresh live worker registers and demo reloads offline. |

## Known gaps

No product defects from the earlier verification reports remain. The only
limitation is the Lighthouse teardown crash after its report was written. It
does not reproduce as a product error. Billing registration is still a separate
factory operation; the public checkout, verification, price, terms, and paid
deliverables remain in place.

