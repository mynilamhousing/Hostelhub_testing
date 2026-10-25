# Platforms & runners

One set of scenarios, three execution targets. The scenario files in
`src/scenarios/` never mention a platform — they talk to `UiDriver` (see
`src/drivers/ui.driver.js`). Each runner supplies an implementation.

| Target | Runner | Driver | App under test | Suite support |
| --- | --- | --- | --- | --- |
| Web | Playwright | `PlaywrightDriver` | deployed Flutter web build | smoke · e2e · regression |
| Android | WebdriverIO + Appium (UiAutomator2) | `AppiumDriver` | release APK on an emulator/device | smoke · e2e |
| iOS | WebdriverIO + Appium (XCUITest) | `AppiumDriver` | simulator/device build | smoke · e2e |

```
src/scenarios/{smoke,e2e}.scenarios.js      ← written once
        │
        ├── tests/web/{smoke,e2e}.spec.js       Playwright runner  → runners/playwright.config.js
        └── tests/native/{smoke,e2e}.test.js    WDIO/Mocha runner  → runners/wdio.{android,ios}.conf.js
```

## Commands

| Command | What it runs |
| --- | --- |
| `npm run test:web:smoke` | 5 smoke scenarios in Chromium (desktop) |
| `npm run test:web:e2e` | e2e scenarios in Chromium |
| `npm run test:web:regression` | API contract + session/routing (web only) |
| `npm run test:web:all` | everything on web |
| `npm run test:web:mobile` | smoke on a Pixel 7 viewport (responsive layout) |
| `npm run test:android:smoke` | smoke on the Android emulator |
| `npm run test:android:e2e` | e2e on the Android emulator |
| `npm run test:android:all` | smoke + e2e on Android |
| `npm run test:ios:smoke` | smoke on the iOS simulator (macOS) |
| `npm run test:ios:e2e` | e2e on the iOS simulator (macOS) |
| `npm run test:ios:all` | smoke + e2e on iOS |
| `npm run test:all` | web + Android (the CI-capable pair) |

## Android emulator setup

```bash
# 1. One-time: SDK + emulator image
sdkmanager "platform-tools" "platforms;android-34" "system-images;android-34;google_apis;x86_64"
avdmanager create avd -n Pixel_7_API_34 -k "system-images;android-34;google_apis;x86_64" -d pixel_7

# 2. Build the app (from the application repo)
cd ../Hostelhub/hostelhub
flutter build apk --release \
  --dart-define=BACKEND=cloudflare \
  --dart-define=CLOUDFLARE_BASE_URL=https://hostelhub.mynilamhousing.workers.dev

# 3. Boot the emulator, then run
emulator -avd Pixel_7_API_34 &
adb wait-for-device
cd ../../Hostelhub_testing
ANDROID_DEVICE_NAME=emulator-5554 npm run test:android:smoke
```

`.env` keys: `ANDROID_APP_PATH`, `ANDROID_DEVICE_NAME`, `ANDROID_PLATFORM_VERSION`,
`APPIUM_HOST`, `APPIUM_PORT`.

## iOS simulator setup (macOS only)

```bash
xcode-select --install
xcrun simctl list devices | grep iPhone
xcrun simctl boot "iPhone 15"

# Build for the simulator (from the application repo)
cd ../Hostelhub/hostelhub
flutter build ios --simulator --dart-define=BACKEND=cloudflare

cd ../../Hostelhub_testing
IOS_DEVICE_NAME="iPhone 15" IOS_APP_PATH="../Hostelhub/hostelhub/build/ios/iphonesimulator/Runner.app" \
  npm run test:ios:smoke
```

Requirements: macOS with Xcode, `appium-xcuitest-driver` installed
(`appium driver install xcuitest`), and WebDriverAgent able to launch (Xcode
signing configured). iOS cannot run on Windows or Linux.

## Adding a scenario

1. Add an object to `src/scenarios/smoke.scenarios.js` or `e2e.scenarios.js`:
   `{ id, title, tags, prepare?, run }`. Use `ctx.screens` and `ctx.tenant`.
2. Do not add platform checks. If the capability is missing, extend `UiDriver`
   and implement it in both drivers.
3. Re-run `npm run testcases` so the catalogue keeps matching the suite.

## Isolation

`runScenario()` calls `driver.reset()` first:

- web → clears `localStorage`/`sessionStorage`, reloads;
- Android → `mobile: clearApp`, relaunch;
- iOS → terminate + activate (no clearApp equivalent).

So every scenario starts signed out with a clean session, on every platform, and
each test provisions its own tenant through the API.

## Verified status

| Target | State | Evidence |
| --- | --- | --- |
| Web | executed | 30/30 passing (5 smoke · 15 e2e · 10 regression) against production |
| Android | wiring verified | runner → Appium → UiAutomator2 session; blocked here only by `ANDROID_HOME` (no SDK/emulator on this workstation) |
| iOS | wiring verified | runner → Appium → XCUITest capability; blocked here by missing driver + app bundle (Windows host) |

The two native targets need a machine that can host their device:
Android works on any OS with the SDK + a booted AVD (or the CI job in
`.github/workflows/qa.yml`), iOS needs macOS with Xcode.
