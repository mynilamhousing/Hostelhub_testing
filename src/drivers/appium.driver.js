/**
 * AppiumDriver — native platform adapter (Android emulator / iOS simulator).
 *
 * Flutter publishes its Semantics tree to the platform accessibility layer, so
 * the same labels the web tests use work here as accessibility ids
 * (`~Username`) or `content-desc` / `label` attributes.
 */
import { UiDriver } from './ui.driver.js';
import { TIMEOUTS } from '../config/constants.js';

/** Longest alphanumeric run inside a RegExp — used for XPath contains(). */
function needleOf(matcher) {
  if (typeof matcher === 'string') return matcher;
  const runs = String(matcher.source).match(/[A-Za-z0-9 ]+/g) || [];
  return (runs.sort((a, b) => b.length - a.length)[0] || '').trim();
}

export class AppiumDriver extends UiDriver {
  /**
   * @param {WebdriverIO.Browser} browser
   * @param {{ platform: 'android'|'ios', appId: string }} options
   */
  constructor(browser, { platform, appId }) {
    super();
    this.browser = browser;
    this.appId = appId;
    this._platform = platform;
  }

  get platform() {
    return this._platform;
  }

  /** Native has no SPA routes — scenarios fall back to UI navigation. */
  get supportsRoutes() {
    return false;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  /** Fresh session: clear app data so the previous scenario's login is gone. */
  async reset() {
    await this.browser.terminateApp(this.appId).catch(() => {});
    try {
      await this.browser.execute('mobile: clearApp', { appId: this.appId });
    } catch {
      // iOS has no clearApp; terminate is the best available isolation.
    }
    await this.browser.pause(500);
    await this.browser.activateApp(this.appId);
    await this.start();
  }

  async start() {
    try {
      await this.browser.activateApp(this.appId);
    } catch {
      // App is already foreground, or the session started it.
    }
    await this.browser.pause(1500);
    await this.waitForText(/Welcome back|Inmates|Occupancy|Set up your hostel/, 90_000);
  }

  async restart() {
    await this.browser.terminateApp(this.appId).catch(() => {});
    await this.browser.pause(800);
    await this.browser.activateApp(this.appId);
    await this.start();
  }

  async close() {
    await this.browser.deleteSession().catch(() => {});
  }

  // ── Reading ───────────────────────────────────────────────────────────────
  /** One round trip: pull the page source and collect accessibility strings. */
  async text() {
    const source = await this.browser.getPageSource();
    const values = [...source.matchAll(/(?:content-desc|label|text)="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((v) => v.trim().length > 0);
    return [...new Set(values)].join(' ').replace(/\s+/g, ' ').trim();
  }

  async waitForText(matcher, timeout = TIMEOUTS.text) {
    const ok = typeof matcher === 'string'
      ? () => this.text().then((t) => t.includes(matcher))
      : () => this.text().then((t) => matcher.test(t));

    await this.browser.waitUntil(ok, {
      timeout,
      interval: 500,
      timeoutMsg: `expected screen text to match ${matcher}`,
    });
  }

  async exists(name) {
    return (await this.#elements(name)).length > 0;
  }

  async viewport() {
    const { width, height } = await this.browser.getWindowSize();
    return { width, height };
  }

  // ── Interaction ───────────────────────────────────────────────────────────
  async tap(name) {
    const element = await this.#element(name);
    await element.waitForDisplayed({ timeout: TIMEOUTS.text });
    await element.click();
    await this.browser.pause(TIMEOUTS.shortPause);
  }

  async fill(label, value) {
    const field = await this.#element(label);
    await field.waitForDisplayed({ timeout: TIMEOUTS.text });
    await field.click();
    await this.browser.pause(200);
    try {
      await field.clearValue();
    } catch {
      // Empty field on some drivers — nothing to clear.
    }
    await field.setValue(String(value));
    await this.browser.pause(200);
  }

  async tapTab(name) {
    await this.tap(name);
    await this.browser.pause(TIMEOUTS.uiSettle);
  }

  async back() {
    const backButton = await this.#elements(/^Back$/);
    if (backButton.length > 0) {
      await backButton[0].click();
    } else {
      await this.browser.back();
    }
    await this.browser.pause(TIMEOUTS.uiSettle);
  }

  async scrollDown() {
    const { width, height } = await this.viewport();
    const cx = Math.round(width / 2);
    const startY = Math.round(height * 0.75);
    const endY = Math.round(height * 0.25);

    await this.browser.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: cx, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 200 },
          { type: 'pointerMove', duration: 600, x: cx, y: endY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);
    await this.browser.releaseActions();
    await this.browser.pause(600);
  }

  /** Native builds expose no internal routes. */
  async goRoute(_route) {
    throw new Error('goRoute() is not supported on native; navigate through the UI instead');
  }

  // ── Selector strategy ─────────────────────────────────────────────────────
  #accessibilityId(name) {
    return `~${name}`;
  }

  #xpathContains(name) {
    const needle = needleOf(name);
    return `//*[contains(@content-desc, "${needle}") or contains(@label, "${needle}") or contains(@text, "${needle}")]`;
  }

  async #elements(name) {
    if (typeof name === 'string') {
      const byId = await this.browser.$$(this.#accessibilityId(name));
      if (byId.length > 0) return byId;
    }
    return this.browser.$$(this.#xpathContains(name));
  }

  async #element(name) {
    const elements = await this.#elements(name);
    if (elements.length === 0) {
      // Return a locator so callers get a proper "not displayed" error with the selector.
      return this.browser.$(this.#xpathContains(name));
    }
    return elements[0];
  }
}
