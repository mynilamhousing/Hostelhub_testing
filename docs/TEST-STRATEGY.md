# Test strategy — HostelHub

## Test pyramid for this product

| Layer | Count | Runtime | Runs on |
| --- | --- | --- | --- |
| Smoke | 5 scenarios | < 1 min (web) | web · Android · iOS — every deploy |
| E2E | 15 scenarios | ~5 min (web) | web · Android · iOS — every PR |
| Regression | 10 (API contract + session) | ~4 min | web only |
| Manual | 10 | — | release sign-off |

Scenarios are defined once (`src/scenarios/`) and executed by three runners:
Playwright for web, Appium/UiAutomator2 for the Android emulator, Appium/XCUITest
for the iOS simulator. Native runs cover smoke + e2e; the API-contract and
session/routing regression suites are browser/Worker specific and stay on web.

Why this shape: the backend is a single Worker over one D1 database, so
contract-level tests are cheap and catch most breakage (`REG-API-*`). The Flutter
UI is canvas-rendered on web and accessibility-driven on native, which makes UI
tests expensive, so they are limited to journeys that carry risk — onboarding,
resident creation, auth, polls, ops screens.

## What we deliberately do *not* test

- Pixel-perfect layout: covered by the responsive layout review, not assertions.
- Third-party gateways (Razorpay, Resend) in CI: replaced by the mock gateway and log transport.
- Every CRUD permutation: covered once per pattern, not per entity.

## Automation boundaries

| Concern | Owner |
| --- | --- |
| Data seeding / teardown | `src/fixtures/tenant.js` + `src/api` — fast and deterministic |
| Platform differences (locators, gestures, lifecycle) | `src/drivers/*` |
| Screen behaviour | `src/screens/*` (page objects on `UiDriver`) |
| Test scenarios | `src/scenarios/*` — platform-neutral by rule |
| Runner wiring | `tests/web/*`, `tests/native/*`, `runners/*` |

## Environments

| Environment | Web | API | Purpose |
| --- | --- | --- | --- |
| Production | hostelhub.mynilam.in | hostelhub.mynilamhousing.workers.dev | smoke + nightly regression |
| Local | http://127.0.0.1:8099 (flutter build web) | http://127.0.0.1:8081 (Dart shelf) | feature development |
| Preview | `<hash>.hostelhub-2rt.pages.dev` | same worker | PR verification |

All three are selected purely through `.env` — no code changes.

## Release gates

1. Smoke suite green against the deployed build.
2. Regression suite green (API contract + occupancy + session).
3. Manual cases `MNL-*` signed off in the Jira test cycle.
4. Native suite green on the release APK before store submission.

## Known constraints

- **No authentication on the app's REST calls yet.** The Worker signs JWTs but the Flutter
  client identifies tenants by `owner_id`/`property_id`, so `REG-API-06` proves isolation by
  data scoping, not by token enforcement. When bearer tokens are enforced client-side, add a
  regression that a forged/absent token is rejected.
- **Email is a log transport** until a provider key is configured, so password-reset tests only
  assert the request is accepted (`REG-AUTH-05` equivalent is manual today).
- **R2 is not enabled**, so document upload has no automated path; the documents screen is
  asserted as a smoke-level render (`E2E-OPS-02`).

## Test data policy

- Unique tenant per test (`qa<token>` usernames, `owner+<token>@hostelhub.test` emails).
- No shared fixtures between tests; no ordering dependencies.
- Cleanup via `scripts/cleanup.sql` after a full run.
- Never point the suite at a database you cannot wipe.
