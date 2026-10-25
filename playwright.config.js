import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env.js';

/**
 * Playwright configuration — web layer.
 *
 * Desktop and mobile-web projects run the same specs: the responsive layout is a
 * product requirement (2 columns vs 4, capped forms), so it is tested, not
 * assumed. Native app coverage lives in wdio.conf.js.
 */
export default defineConfig({
  testDir: './tests',
  testMatch: ['smoke/**/*.spec.js', 'e2e/**/*.spec.js', 'regression/**/*.spec.js'],
  testIgnore: ['**/mobile/**'],

  timeout: env.timeout,
  expect: { timeout: env.expectTimeout },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: env.retries,
  workers: env.workers,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
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
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      // Mobile *web* (responsive layout), not native app testing.
      name: 'chromium-mobile-web',
      use: { ...devices['Pixel 7'] },
      testMatch: ['smoke/**/*.spec.js'],
    },
  ],

  outputDir: 'reports/artifacts',
});
