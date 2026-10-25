import { defineConfig, devices } from '@playwright/test';
import { env } from '../src/config/env.js';

/**
 * Web runner configuration (Playwright).
 *
 * Two browser projects:
 *   • desktop-chromium  — full suite (smoke, e2e, regression)
 *   • mobile-web-chromium — responsive-layout smoke only
 *
 * Native targets are configured separately in runners/wdio.*.conf.js and run the
 * same scenarios.
 */
export default defineConfig({
  testDir: '../tests/web',
  testMatch: ['**/*.spec.js'],

  timeout: env.timeout,
  expect: { timeout: env.expectTimeout },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: env.retries,
  workers: env.workers,

  reporter: [
    ['list'],
    ['html', { outputFolder: '../reports/html', open: 'never' }],
    ['json', { outputFile: '../reports/web-results.json' }],
    ['junit', { outputFile: '../reports/web-junit.xml' }],
  ],

  use: {
    baseURL: env.webBaseUrl,
    actionTimeout: 25_000,
    navigationTimeout: 60_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-web-chromium',
      use: { ...devices['Pixel 7'] },
      testMatch: ['**/smoke.spec.js'],
    },
  ],

  outputDir: '../reports/artifacts',
});
