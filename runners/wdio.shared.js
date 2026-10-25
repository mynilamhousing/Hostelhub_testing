import { fileURLToPath } from 'node:url';
import { env } from '../src/config/env.js';

// Specs are declared relative to the repository root, not to this file.
const projectRoot = fileURLToPath(new URL('..', import.meta.url));

/**
 * Shared Appium runner configuration.
 *
 * android/ios configs supply capabilities; everything else — suites, timeouts,
 * reporting, Appium service — is defined once here so the two native runners
 * cannot drift apart.
 */
export function nativeConfig({ platform, capabilities, appPath }) {
  process.env.PLATFORM = platform;

  return {
    runner: 'local',
    rootDir: projectRoot,
    specs: [],
    suites: {
      smoke: ['./tests/native/smoke.mobile.test.js'],
      e2e: ['./tests/native/e2e.mobile.test.js'],
    },
    maxInstances: 1,
    logLevel: process.env.WDIO_LOG_LEVEL || 'info',

    // One session per scenario: reset() clears app data between tests.
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
    mochaOpts: { ui: 'bdd', timeout: 240_000 },

    reporters: [
      'spec',
      ['junit', {
        outputDir: `./reports/${platform}`,
        outputFileFormat: (options) => `wdio-${platform}-${options.capabilities.platformName}.xml`,
      }],
    ],

    capabilities: [capabilities],

    // Fail fast with a readable message when the binary is missing.
    beforeSession: () => {
      if (!appPath) {
        throw new Error(`${platform}: app binary not configured. Set the app path env var in .env`);
      }
    },
  };
}
