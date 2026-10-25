# HostelHub Testing

Automation and test-case repository for HostelHub — the Flutter app + Cloudflare backend that
runs hostel operations (rent, mess polls, complaints, visitors, expenses, documents).

Everything in here is **test only**. The application lives in `AanandAB/Hostelhub`.

| Layer | Tool | Target |
| --- | --- | --- |
| Web (desktop + mobile browser) | Playwright + JavaScript | https://hostelhub.mynilam.in |
| Native Android / iOS | WebdriverIO + Appium | the Flutter release build |
| API | Playwright request layer | https://hostelhub.mynilamhousing.workers.dev |

## Architecture — Page Object Model

```
src/
├── config/      env.js (targets, timeouts) · constants.js (routes, tabs, labels, text)
├── core/        flutter.driver.js · base.page.js           ← infrastructure
├── api/         hostelhub.api.js · endpoints.js            ← data setup & contract checks
├── components/  bottom-nav · dialog                        ← shared UI, not tied to a route
├── pages/       login · register · forgot-password ·
│                dashboard · inmates · add-inmate ·
│                polls · more · ops                         ← one class per screen
├── flows/       journeys.js (AuthFlow, InmateFlow)         ← business journeys
└── fixtures/    index.js (DI) · data.factory.js            ← test wiring & unique data
tests/
├── smoke/       deploy gate — 5 checks, < 1 min
├── e2e/         feature journeys (auth, onboarding, inmates, polls, ops)
├── regression/  API contract, occupancy rules, session & routing
└── mobile/      Appium specs (*.mobile.test.js)
scripts/         test-case catalogue + generator + cleanup SQL
docs/            generated Excel / CSV / Markdown, test strategy
```

**Layering rules**

1. `tests/**` contain no selectors and no waits — they compose pages and flows.
2. A page object owns the selectors for one screen and exposes intent (`login()`, `addInmate()`).
3. A flow chains pages into a business process (`AuthFlow.signIn`, `InmateFlow.addResident`).
4. Components (`BottomNav`, `DialogComponent`) are shared by many pages.
5. `src/core/base.page.js` is the only place with the Flutter quirks (click-before-type,
   semantics bootstrap, lazy-list scrolling).
6. Fixtures inject everything a test needs and seed an isolated tenant per test.

Result: a UI change touches one page object; a process change touches one flow; a test only
ever describes expected behaviour.

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

## Running

```bash
npm run test:smoke          # deploy gate (~1 min)
npm run test:e2e            # feature journeys
npm run test:regression     # deep regression (API contract, occupancy, session)
npm test                    # all of the above
npm run test:mobile-web     # smoke suite on a Pixel 7 viewport
npm run test:mobile         # Appium suite (needs emulator + APK)
npm run report              # open the last HTML report
```

Tag and project filters work as usual:

```bash
npx playwright test --grep @regression
npx playwright test --project=chromium-mobile-web
npx playwright test tests/e2e/inmates.spec.js
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
