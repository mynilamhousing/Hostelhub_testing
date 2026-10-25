/**
 * PlaywrightDriver — web platform adapter.
 *
 * HostelHub web paints into <canvas>, so the adapter connects Playwright to
 * Flutter's accessibility (semantics) tree on start, then everything is plain
 * role/label interaction. All Flutter-specific quirks live here:
 *   • semantics bootstrap (and re-bootstrap after reload),
 *   • click-before-type for text fields,
 *   • hash-route navigation instead of full page loads.
 */
import { expect } from '@playwright/test';
import { UiDriver } from './ui.driver.js';
import { TIMEOUTS } from '../config/constants.js';

export class PlaywrightDriver extends UiDriver {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {{ baseUrl: string }} options
   */
  constructor(page, { baseUrl }) {
    super();
    this.page = page;
    this.baseUrl = baseUrl;
  }

  get platform() {
    return 'web';
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  /** Fresh session: drop the persisted user, then boot. */
  async reset() {
    await this.page.goto(this.baseUrl, { waitUntil: 'load', timeout: 60_000 });
    await this.page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        /* storage blocked — nothing to clear */
      }
    });
    await this.restart();
  }

  async start() {
    await this.page.goto(this.baseUrl, { waitUntil: 'load', timeout: 60_000 });
    await this.#waitForFlutter();
    await this.#enableSemantics();
    await this.page.waitForTimeout(TIMEOUTS.uiSettle);
  }

  async restart() {
    await this.page.reload({ waitUntil: 'load' });
    await this.#waitForFlutter();
    await this.#enableSemantics();
    await this.page.waitForTimeout(TIMEOUTS.uiSettle);
  }

  async close() {
    await this.page.close().catch(() => {});
  }

  // ── Reading ───────────────────────────────────────────────────────────────
  async text() {
    return (await this.page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').trim();
  }

  async waitForText(matcher, timeout = TIMEOUTS.text) {
    await expect
      .poll(() => this.text(), { timeout, message: `expected screen text to match ${matcher}` })
      .toMatch(matcher);
  }

  async exists(name) {
    const locator = this.#button(name);
    return (await locator.count()) > 0;
  }

  async viewport() {
    const size = this.page.viewportSize() || { width: 1280, height: 900 };
    return size;
  }

  // ── Interaction ───────────────────────────────────────────────────────────
  async tap(name) {
    const locator = await this.#resolve(name);
    await expect(locator).toBeVisible({ timeout: TIMEOUTS.text });
    await locator.click();
    await this.page.waitForTimeout(TIMEOUTS.shortPause);
  }

  async fill(label, value) {
    const field = this.page.getByLabel(label, { exact: false }).first();
    await field.waitFor({ state: 'attached', timeout: TIMEOUTS.text });
    // Flutter needs a real focus click before the engine accepts input.
    await field.click();
    await this.page.waitForTimeout(250);
    await field.fill(String(value));
    await this.page.waitForTimeout(200);
  }

  async tapTab(name) {
    await this.tap(name);
    await this.page.waitForTimeout(TIMEOUTS.uiSettle);
  }

  async back() {
    const backButton = await this.#resolve(/^Back$/);
    if (await backButton.count()) {
      await backButton.click();
    } else {
      await this.page.goBack().catch(() => {});
    }
    await this.page.waitForTimeout(TIMEOUTS.uiSettle);
  }

  async scrollDown() {
    const { width, height } = await this.viewport();
    await this.page.mouse.move(width / 2, height / 2);
    await this.page.mouse.wheel(0, Math.round(height * 0.6));
    await this.page.waitForTimeout(600);
  }

  /** SPA hash navigation — a page.goto would reload and drop the session. */
  async goRoute(route) {
    const hash = route.startsWith('#') ? route : `#${route}`;
    await this.page.evaluate((h) => { window.location.hash = h; }, hash);
    await this.page.waitForTimeout(TIMEOUTS.uiSettle);
  }

  // ── Flutter plumbing ──────────────────────────────────────────────────────
  #button(name) {
    const exact = typeof name === 'string';
    return this.page.getByRole('button', { name, exact });
  }

  /**
   * Flutter exposes some controls (AppBar back arrow, chips) as generic
   * semantics nodes rather than buttons, so fall back to a text match before
   * giving up — otherwise a perfectly visible control looks "not found".
   */
  async #resolve(name) {
    const asButton = this.#button(name);
    if ((await asButton.count()) > 0) return asButton.first();
    return this.page.getByText(name, { exact: typeof name === 'string' }).first();
  }

  async #waitForFlutter() {
    await this.page.waitForSelector('flt-glass-pane, flutter-view, flt-scene-host', {
      timeout: TIMEOUTS.appBoot,
    });
  }

  async #enableSemantics() {
    const enabled = await this.page.evaluate(
      () => (document.querySelector('flt-semantics-host')?.children.length ?? 0) > 0,
    );
    if (enabled) return;

    await this.page.evaluate(() => document.querySelector('flt-semantics-placeholder')?.click());
    await this.page.waitForTimeout(600);

    const ok = await this.page.evaluate(
      () => (document.querySelector('flt-semantics-host')?.children.length ?? 0) > 0,
    );
    if (!ok) {
      await this.page.waitForTimeout(1200);
      await this.page.evaluate(() => document.querySelector('flt-semantics-placeholder')?.click());
      await this.page.waitForTimeout(400);
    }
  }
}
