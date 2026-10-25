import { nativeConfig } from './wdio.shared.js';
import { env } from '../src/config/env.js';

/**
 * Android runner — emulator or physical device.
 *
 *   emulator -avd Pixel_7_API_34
 *   npm run test:android:smoke
 *
 * Requires an APK built from the app repo:
 *   flutter build apk --release --dart-define=BACKEND=cloudflare
 */
const appPath = env.mobile.androidAppPath;

export const config = nativeConfig({
  platform: 'android',
  appPath,
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': env.mobile.androidDeviceName,
    'appium:platformVersion': env.mobile.androidPlatformVersion,
    'appium:app': appPath,
    'appium:appPackage': 'com.example.hostelhub',
    'appium:appActivity': '.MainActivity',
    'appium:autoGrantPermissions': true,
    'appium:newCommandTimeout': 240,
    'appium:noReset': false,
  },
});
