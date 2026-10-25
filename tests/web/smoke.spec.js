/**
 * Web runner — smoke suite.
 *
 * The scenarios are imported, not re-implemented: Android and iOS run the exact
 * same file through runners/wdio.*.conf.js.
 */
import { test } from '@playwright/test';
import { PlaywrightDriver } from '../../src/drivers/playwright.driver.js';
import { runScenario, scenarioTitle } from '../../src/support/harness.js';
import { smokeScenarios } from '../../src/scenarios/smoke.scenarios.js';
import { env } from '../../src/config/env.js';

test.describe('@smoke web', () => {
  for (const scenario of smokeScenarios) {
    test(scenarioTitle(scenario), async ({ page }) => {
      const driver = new PlaywrightDriver(page, { baseUrl: env.webBaseUrl });
      await runScenario(scenario, driver);
    });
  }
});
