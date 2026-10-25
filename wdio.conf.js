import { env } from './src/config/env.js';

/**
 * WebdriverIO + Appium configuration — native Android/iOS layer.
 *
 * Prerequisites:
 *   npm install                                  # pulls Appium + UiAutomator2
 *   flutter build apk --release \
 *     --dart-define=BACKEND=cloudflare \
 *     --dart-define=CLOUDFLARE_BASE_URL=<worker url>
 *   emulator -avd <name>  (or a device with USB debugging)
 *   npm run test:mobile
 *
 * iOS requires macOS + Xcode + WebDriverAgent and IOS_APP_PATH to be set.
 */
export const config = {
  runner: 'local',
  specs: ['./tests/mobile/**/*.mobile.test.js'],
  maxInstances: 1,
  logLevel: process.env.WDIO_LOG_LEVEL || 'info',

  waitforTimeout: 30_000,
  connectionRetryTimeout: 180_000,
  connectionRetryCount: 2,

  services: [
    ['appium', {
      command: 'appium',
      args: { address: env.mobile.appiumHost, port: env.mobile.appiumPort },
    }],
  ],

  framework: 'mocha',
  mochaOpts: { ui: 'bdd', timeout: 180_000 },
  reporters: ['spec'],

  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': env.mobile.androidDeviceName,
      'appium:platformVersion': env.mobile.androidPlatformVersion,
      'appium:app': env.mobile.androidAppPath,
      'appium:appPackage': 'com.example.hostelhub',
      'appium:appActivity': '.MainActivity',
      'appium:autoGrantPermissions': true,
      'appium:newCommandTimeout': 240,
      'appium:noReset': false,
    },
    ...(env.mobile.iosAppPath
      ? [{
          platformName: 'iOS',
          'appium:automationName': 'XCUITest',
          'appium:deviceName': env.mobile.iosDeviceName,
          'appium:platformVersion': env.mobile.iosPlatformVersion,
          'appium:app': env.mobile.iosAppPath,
          'appium:newCommandTimeout': 240,
        }]
      : []),
  ],
};
