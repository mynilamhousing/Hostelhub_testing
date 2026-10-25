import 'dotenv/config';

/**
 * Environment configuration.
 *
 * One place for every target and secret. Override with environment variables
 * (see .env.example) to point the suite at production, a preview deploy or a
 * local server without touching code.
 */
const int = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const env = Object.freeze({
  webBaseUrl: process.env.WEB_BASE_URL || 'https://hostelhub.mynilam.in',
  apiBaseUrl: process.env.API_BASE_URL || 'https://hostelhub.mynilamhousing.workers.dev',
  testEmailDomain: process.env.TEST_EMAIL_DOMAIN || 'hostelhub.test',
  testPassword: process.env.TEST_PASSWORD || 'Passw0rd!123',

  retries: int(process.env.RETRIES, process.env.CI ? 2 : 0),
  workers: int(process.env.WORKERS, 1),
  timeout: int(process.env.TEST_TIMEOUT, 90_000),
  expectTimeout: int(process.env.EXPECT_TIMEOUT, 20_000),
  apiRetries: int(process.env.API_RETRIES, 2),

  mobile: Object.freeze({
    androidAppPath: process.env.ANDROID_APP_PATH || '../hostelhub/build/app/outputs/flutter-apk/app-release.apk',
    androidDeviceName: process.env.ANDROID_DEVICE_NAME || 'emulator-5554',
    androidPlatformVersion: process.env.ANDROID_PLATFORM_VERSION || '14',
    iosAppPath: process.env.IOS_APP_PATH || '',
    iosDeviceName: process.env.IOS_DEVICE_NAME || 'iPhone 15',
    iosPlatformVersion: process.env.IOS_PLATFORM_VERSION || '17.0',
    appiumHost: process.env.APPIUM_HOST || '127.0.0.1',
    appiumPort: int(process.env.APPIUM_PORT, 4723),
  }),
});

/** Fails fast with a readable message instead of 30 confusing timeouts. */
export async function assertTargetsReachable() {
  for (const [name, url] of [['API', `${env.apiBaseUrl}/health`], ['Web', env.webBaseUrl]]) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (error) {
      throw new Error(`${name} target not reachable: ${url} — ${error.message}. Check .env`);
    }
  }
}
