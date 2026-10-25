/**
 * Native runner — e2e suite (Android emulator / iOS simulator).
 * Same scenarios as tests/web/e2e.spec.js.
 */
import { browser } from '@wdio/globals';
import { AppiumDriver } from '../../src/drivers/appium.driver.js';
import { runScenario, scenarioTitle } from '../../src/support/harness.js';
import { e2eScenarios } from '../../src/scenarios/e2e.scenarios.js';
import { resolvePlatform } from '../../src/config/platforms.js';

const platformKey = process.env.PLATFORM || 'android';
const platform = resolvePlatform(platformKey);

describe(`@e2e ${platform.label}`, () => {
  for (const scenario of e2eScenarios) {
    it(scenarioTitle(scenario), async () => {
      const driver = new AppiumDriver(browser, { platform: platformKey, appId: platform.appId });
      await runScenario(scenario, driver);
    });
  }
});
