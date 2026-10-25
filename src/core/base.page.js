/**
 * BasePage — the contract every page object inherits.
 *
 * Rules for this framework:
 *   • Page objects own selectors and expose intention-revealing actions.
 *   • Tests never touch locators; they compose page/flow methods only.
 *   • Assertions live in page objects when they describe the page ("expectLoaded")
 *     and in tests when they describe the business rule.
 */
import { expect } from '@playwright/test';
import { appText, currentRoute, goToRoute, reloadApp } from './flutter.driver.js';
import { TIMEOUTS } from '../config/constants.js';

export class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  // ── Queries ───────────────────────────────────────────────────────────────
  byLabel(label) {
    return this.page.getByLabel(label, { exact: false }).first();
  }

  byRoleButton(name) {
    return this.page.getByRole('button', { name, exact: typeof name === 'string' });
  }

  async text() {
    return appText(this.page);
  }

  get route() {
    return currentRoute(this.page);
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  /**
   * Flutter text fields need a real focus click before Playwright can type;
   * fill() alone leaves the engine's editing state empty.
   */
  async fillField(label, value) {
    const field = this.byLabel(label);
    await field.click();
    await this.page.waitForTimeout(250);
    await field.fill(String(value));
    await this.page.waitForTimeout(250);
  }

  async tapButton(name) {
    await this.byRoleButton(name).click();
    await this.page.waitForTimeout(TIMEOUTS.shortPause);
  }

  async goTo(route) {
    await goToRoute(this.page, route);
  }

  async reload() {
    await reloadApp(this.page);
  }

  /** Scrolls the current list until the target appears (lazy ListViews). */
  async scrollToFind(locator, attempts = 4, step = 900) {
    for (let i = 0; i < attempts && !(await locator.count()); i += 1) {
      await this.page.mouse.move(600, 500);
      await this.page.mouse.wheel(0, step);
      await this.page.waitForTimeout(600);
    }
    return locator;
  }

  // ── Assertions ────────────────────────────────────────────────────────────
  async expectText(matcher, timeout = TIMEOUTS.text) {
    await expect
      .poll(() => this.text(), { timeout, message: `expected page text to match ${matcher}` })
      .toMatch(matcher);
  }

  async expectRoute(expected, timeout = TIMEOUTS.navigation) {
    await expect.poll(() => this.route, { timeout }).toContain(expected);
  }

  async expectNoErrorPage() {
    expect(await this.text()).not.toContain('Page Not Found');
  }
}
