import { nativeConfig } from './wdio.shared.js';
import { env } from '../src/config/env.js';

/**
 * iOS runner — simulator or physical device. macOS + Xcode + WebDriverAgent only.
 *
 *   xcrun simctl boot "iPhone 15"
 *   npm run test:ios:smoke
 *
 * Requires an .app/.ipa built on macOS:
 *   flutter build ios --simulator --dart-define=BACKEND=cloudflare
 *   (or `flutter build ipa` for a device build)
 */
const appPath = env.mobile.iosAppPath;

export const config = nativeConfig({
  platform: 'ios',
  appPath,
  capabilities: {
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:deviceName': env.mobile.iosDeviceName,
    'appium:platformVersion': env.mobile.iosPlatformVersion,
    'appium:app': appPath,
    'appium:bundleId': 'com.example.hostelhub',
    'appium:autoAcceptAlerts': true,
    'appium:newCommandTimeout': 240,
    'appium:noReset': false,
    'appium:wdaLaunchTimeout': 180_000,
  },
});
