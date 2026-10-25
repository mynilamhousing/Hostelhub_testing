/**
 * Web runner — e2e suite. Same scenarios Android and iOS execute.
 */
import { test } from '@playwright/test';
import { PlaywrightDriver } from '../../src/drivers/playwright.driver.js';
import { runScenario, scenarioTitle } from '../../src/support/harness.js';
import { e2eScenarios } from '../../src/scenarios/e2e.scenarios.js';
import { env } from '../../src/config/env.js';

test.describe('@e2e web', () => {
  for (const scenario of e2eScenarios) {
    test(scenarioTitle(scenario), async ({ page }) => {
      const driver = new PlaywrightDriver(page, { baseUrl: env.webBaseUrl });
      await runScenario(scenario, driver);
    });
  }
});
