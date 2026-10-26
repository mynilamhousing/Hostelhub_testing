# HostelHub Testing

Automation and test-case repository for HostelHub — the Flutter app + Cloudflare backend that
runs hostel operations (rent, mess polls, complaints, visitors, expenses, documents).

Everything in here is **test only**. The application lives in `AanandAB/Hostelhub`.

| Layer | Tool | Target |
| --- | --- | --- |
| Web (desktop + mobile browser) | Playwright | https://hostelhub.mynilam.in |
| Android emulator / device | WebdriverIO + Appium (UiAutomator2) | the Flutter release APK |
| iOS simulator / device | WebdriverIO + Appium (XCUITest) | the Flutter iOS build |
| API | Playwright request layer | https://hostelhub.mynilamhousing.workers.dev |

**One scenario source, three runners.** Scenarios in `src/scenarios/` are written
once against a `UiDriver` contract; the web runner supplies Playwright, the two
native runners supply Appium. Smoke and e2e run on all three platforms — see
[`docs/PLATFORMS.md`](docs/PLATFORMS.md) for the full matrix and emulator setup.

## Architecture — Page Object Model + driver adapters

```
src/
├── config/      env.js · constants.js · platforms.js        targets, routes, platform matrix
├── drivers/     ui.driver.js (contract)
│                playwright.driver.js · appium.driver.js    platform adapters
├── screens/     login · dashboard · inmates · add-inmate ·
│                polls · more · ops                          one class per screen
├── scenarios/   smoke.scenarios.js · e2e.scenarios.js      written once, run everywhere
├── api/         hostelhub.api.js · endpoints.js            data setup + contract checks
├── fixtures/    tenant.js · data.factory.js                isolated tenant per scenario
└── support/     harness.js · assert.js                     runner-neutral glue
tests/
├── web/         smoke.spec.js · e2e.spec.js · regression.spec.js   (Playwright)
└── native/      smoke.mobile.test.js · e2e.mobile.test.js          (WDIO/Mocha)
runners/
├── playwright.config.js
├── wdio.shared.js
├── wdio.android.conf.js
└── wdio.ios.conf.js
scripts/         test-case catalogue + generator + cleanup SQL
docs/            PLATFORMS · TEST-STRATEGY · generated Excel/CSV/Markdown
```

**Layering rules**

1. `tests/**` are thin harnesses — they only bind a driver to the scenario list.
2. `src/scenarios/**` describe behaviour and must stay platform-neutral: no
   selectors, no waits, no `if (platform === …)`.
3. `src/screens/**` are page objects on top of `UiDriver` (`login()`,
   `openAddInmate()`, `expectInmate()`).
4. `src/drivers/**` is the only place that knows Playwright or WebdriverIO —
   including the Flutter-web semantics bootstrap and the click-before-type quirk.
5. `src/fixtures/tenant.js` provisions an isolated owner/property/room through
   the API, identically on every platform.
6. `src/support/harness.js` calls `driver.reset()` then `prepare()` then `run()`,
   so every scenario starts signed out with fresh data.

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

## Runner status

| Target | State |
| --- | --- |
| Web (Playwright) | **30/30 passing** against production — 5 smoke, 15 e2e, 10 regression |
| Android (Appium) | runner reaches an UiAutomator2 session; needs `ANDROID_HOME` + a booted AVD |
| iOS (Appium) | runner reaches an XCUITest session; needs macOS + Xcode + the `.app` bundle |

## Running

```bash
# Web
npm run test:web:smoke          # deploy gate (~1 min)
npm run test:web:e2e
npm run test:web:regression     # API contract + session/routing (web only)
npm run test:web:all
npm run test:web:mobile         # smoke on a Pixel 7 viewport

# Android emulator
npm run test:android:smoke
npm run test:android:e2e
npm run test:android:all

# iOS simulator (macOS)
npm run test:ios:smoke
npm run test:ios:e2e
npm run test:ios:all

# Both CI-capable targets
npm run test:all

npm run report                  # open the last web HTML report
```

Filters still work inside a runner:

```bash
npx playwright test --config runners/playwright.config.js --grep @regression
wdio run runners/wdio.android.conf.js --suite smoke --spec tests/native/smoke.mobile.test.js
```

## Driving a Flutter web app with Playwright

HostelHub's web build paints to `<canvas>`, so DOM queries return nothing. The framework
activates Flutter's accessibility tree (`src/core/flutter.driver.js`) and then uses normal
Playwright locators against it — `getByRole('button', { name: 'Log in' })`,
`getByLabel('Username')`. Two rules the base page enforces for you:

- text fields need a **click before typing** (`fillField`);
- a full reload drops the semantics tree, so use `page.reload()` on the base page, not
  `page.reload()` directly.

## Test data

Every test gets its own owner (`src/fixtures/index.js`) with a unique username/email on
`TEST_EMAIL_DOMAIN`, so suites are isolated and can be re-run without collisions. Property,
rooms, residents, polls and notices are seeded through the API — faster and far less brittle
than clicking through onboarding before each test. UI paths are still exercised by dedicated
tests (`E2E-INM-02`, `E2E-AUTH-*`).

Clean up after a run:

```bash
cd ../Hostelhub/workers
npx wrangler d1 execute hostelhub --remote --command "$(sed -n '9p' ../../Hostelhub_testing/scripts/cleanup.sql)"
# …or run each statement in scripts/cleanup.sql one by one
```

## Native (Appium)

```bash
cd ../Hostelhub/hostelhub
flutter build apk --release \
  --dart-define=BACKEND=cloudflare \
  --dart-define=CLOUDFLARE_BASE_URL=https://hostelhub.mynilamhousing.workers.dev

cd ../../Hostelhub_testing
ANDROID_APP_PATH=../Hostelhub/hostelhub/build/app/outputs/flutter-apk/app-release.apk npm run test:mobile
```

Flutter publishes Semantics labels to the platform accessibility layer, so mobile selectors
(`~Username`, `~Log in`, `~Inmates`) mirror the web ones.

## Test-case catalogue (308 cases, 960 steps)

```bash
npm run testcases
```

Source of truth is `scripts/testcases/` — one file per module, one `tc(...)` call per
case, so the catalogue is code-reviewed like the tests:

```
scripts/testcases/
├── _helpers.js            tc() builder + shared preconditions/data
├── 01-auth.js             AUTH-001…026   login, register, reset, role routing, session
├── 02-onboarding.js       ONB-001…020    create hostel, rooms, capacity, multi-property
├── 03-residents.js        RES-001…024    add resident, credentials, room change, billing
├── 04-rent.js             RENT-001…022   rent plans, pay flow, receipts, expenses, P&L
├── 05-polls.js            POLL-001…022   create poll, vote, tally, nudge, timezone
├── 06-chat.js             CHAT-001…014   owner↔resident threads, isolation, XSS
├── 07-notices.js          NOT-001…010    post, pin, resident view
├── 08-complaints.js       CMP-001…014    raise, statuses, counters, isolation
├── 09-visitors-leave.js   VIS-001…014    visitor check-in/out, leave records
├── 10-deposits-checkout.js DEP-001…016   deposit, deductions, checkout, refund
├── 11-documents.js        DOC-001…010    upload, edit, delete, isolation
├── 12-resident-app.js     RAPP-001…022   resident shell, rent, polls, SOS, ratings
├── 13-ops-misc.js         OPS-001…020    settings, ratings, SOS, upgrade, legal, dashboard
├── 14-admin.js            ADM-001…010    admin login, global rates, overrides
├── 15-api-contract.js     API-001…018    health, CORS, auth, types, errors, round-trips
├── 16-security.js         SEC-001…016    IDOR, isolation, injection, XSS, secrets
├── 17-web-ui.js           WEB-001…015    breakpoints, overflow, deep links, a11y
├── 18-e2e.js              E2E-001…015    multi-role journeys from signup to checkout
└── index.js               module order + ALL_CASES
```

Each case carries: type (Functional / Negative / Validation / Boundary / Security /
E2E / API / UI / Compatibility), priority P0–P3 + severity, role, platform,
preconditions, test data, numbered steps with a matching numbered expected result,
postconditions, the automation spec (or `Manual`), requirement, notes.

Writes three artefacts to `docs/`:

| File | Sheets / use |
| --- | --- |
| `HostelHub_TestCases.xlsx` | Cover · Summary (per module, priority, type, role, coverage %) · Test Cases (17 columns, filters, frozen panes, priority colour chips) · Step Detail (one row per step) · Traceability · Execution Log (status drop-down) · Jira Import |
| `jira-import.csv` | Jira → Issues → Import issues from CSV |
| `TEST-CASES.md` | Readable index for code review |

Jira mapping: `Summary`, `Issue Type`, `Priority`, `Labels`, `Component`, `Epic Link`, `Description`.
The description carries the ID, preconditions, steps and expected results, so a `Test`
issue is self-contained.

Current split: **308 cases · 960 steps · 26 automated · 282 manual**, P0 81 / P1 116 / P2 103 / P3 8.

## Conventions

- Test IDs are stable and appear in three places: the spec name, the catalogue row, the Jira issue.
  Never renumber; add new IDs.
- Tags: `@smoke`, `@e2e`, `@regression`, `@mobile` — they map to folders and npm scripts.
- Assert on user-visible text or API contracts, never on widget keys.
- Every failure message must name the expectation (`expect(text, 'room 101 should be listed')`).
- Keep the smoke suite under one minute; it is the deploy gate.

See `docs/TEST-STRATEGY.md` for the pyramid, environments and release gates.
