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

## Test-case catalogue (manual + automated)

```bash
npm run testcases
```

Writes three artefacts to `docs/`:

| File | Use |
| --- | --- |
| `HostelHub_TestCases.xlsx` | Summary · Test Cases (steps, expected, data, automation link) · Jira Import |
| `jira-import.csv` | Jira → Issues → Import issues from CSV |
| `TEST-CASES.md` | Readable index for code review |

Jira mapping: `Summary`, `Issue Type`, `Priority`, `Labels`, `Description`, `External issue ID`.
The external ID is the test-case ID, so re-importing **updates** instead of duplicating.
`JIRA_ISSUE_TYPE=Task` by default; set `Test` if the project has Xray/Zephyr.

## Conventions

- Test IDs are stable and appear in three places: the spec name, the catalogue row, the Jira issue.
  Never renumber; add new IDs.
- Tags: `@smoke`, `@e2e`, `@regression`, `@mobile` — they map to folders and npm scripts.
- Assert on user-visible text or API contracts, never on widget keys.
- Every failure message must name the expectation (`expect(text, 'room 101 should be listed')`).
- Keep the smoke suite under one minute; it is the deploy gate.

See `docs/TEST-STRATEGY.md` for the pyramid, environments and release gates.
