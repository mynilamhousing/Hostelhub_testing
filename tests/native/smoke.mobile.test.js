/**
 * Native runner — smoke suite (Android emulator / iOS simulator).
 *
 * Uses the same scenario definitions as the web runner. PLATFORM is set by the
 * wdio config (android | ios) and selects the capabilities + app id.
 */
import { browser } from '@wdio/globals';
import { AppiumDriver } from '../../src/drivers/appium.driver.js';
import { runScenario, scenarioTitle } from '../../src/support/harness.js';
import { smokeScenarios } from '../../src/scenarios/smoke.scenarios.js';
import { resolvePlatform } from '../../src/config/platforms.js';

const platformKey = process.env.PLATFORM || 'android';
const platform = resolvePlatform(platformKey);

describe(`@smoke ${platform.label}`, () => {
  for (const scenario of smokeScenarios) {
    it(scenarioTitle(scenario), async () => {
      const driver = new AppiumDriver(browser, { platform: platformKey, appId: platform.appId });
      await runScenario(scenario, driver);
    });
  }
});
