/**
 * Scenario harness — the glue shared by every runner.
 *
 * A runner only has to: build a UiDriver, then call runScenario(). Everything
 * else (screens, tenant provisioning, context) is identical on web and native,
 * which is what keeps the suite honest across platforms.
 */
import { api } from '../api/hostelhub.api.js';
import { makeScreens } from '../screens/index.js';

/** Builds the context a scenario receives. */
export function buildContext(driver) {
  return {
    driver,
    screens: makeScreens(driver),
    api,
    tenant: null,
    inmate: null,
  };
}

/**
 * Boots the app, prepares data, executes the scenario.
 * @param {{id: string, title: string, prepare?: Function, run: Function}} scenario
 * @param {import('../drivers/ui.driver.js').UiDriver} driver
 */
export async function runScenario(scenario, driver) {
  const context = buildContext(driver);
  await driver.reset();
  if (scenario.prepare) await scenario.prepare(context);
  await scenario.run(context);
  return context;
}

/** Formats a scenario title consistently in both runners. */
export function scenarioTitle(scenario) {
  return `${scenario.id} — ${scenario.title}`;
}
