/**
 * UiDriver — the platform contract.
 *
 * Every screen and scenario talks to this interface, never to Playwright or
 * WebdriverIO directly. That is what lets one scenario run on:
 *
 *   • web          → PlaywrightDriver  (Chromium, Flutter semantics tree)
 *   • Android      → AppiumDriver      (UiAutomator2, accessibility ids)
 *   • iOS          → AppiumDriver      (XCUITest, accessibility labels)
 *
 * Implementations must be duck-typed against this class: same method names,
 * same semantics, same error messages. Add a capability here first, then
 * implement it in every driver.
 */
export class UiDriver {
  /** Human-readable platform name, used in logs and reports. */
  get platform() {
    throw new Error('platform must be implemented');
  }

  /**
   * Clears persisted state and starts the app, so every scenario begins signed
   * out on a fresh session. Called by the harness before each scenario.
   */
  async reset() {
    throw new Error('reset() must be implemented');
  }

  /** Launches (or focuses) the app and waits until it is interactive. */
  async start() {
    throw new Error('start() must be implemented');
  }

  /** Restarts the app. Web reloads the page; native relaunches the activity. */
  async restart() {
    throw new Error('restart() must be implemented');
  }

  /** Full visible text of the current screen (whitespace-collapsed). */
  async text() {
    throw new Error('text() must be implemented');
  }

  /** Waits until the screen text matches a string or RegExp. */
  async waitForText(_matcher, _timeout) {
    throw new Error('waitForText() must be implemented');
  }

  /** Clicks the element whose accessible name matches (string = exact). */
  async tap(_name) {
    throw new Error('tap() must be implemented');
  }

  /** Types into the field with the given accessible label. */
  async fill(_label, _value) {
    throw new Error('fill() must be implemented');
  }

  /** Opens a bottom-navigation tab by label. */
  async tapTab(_name) {
    throw new Error('tapTab() must be implemented');
  }

  /** Goes back one screen (AppBar back / system back). */
  async back() {
    throw new Error('back() must be implemented');
  }

  /** Scrolls the active screen down by one viewport-ish step. */
  async scrollDown() {
    throw new Error('scrollDown() must be implemented');
  }

  /** Navigates to an internal route where the platform supports it. */
  async goRoute(_route) {
    throw new Error('goRoute() must be implemented');
  }

  /** True when the element with this accessible name exists (no wait). */
  async exists(_name) {
    throw new Error('exists() must be implemented');
  }

  /** Screen size, used for gesture coordinates. */
  async viewport() {
    throw new Error('viewport() must be implemented');
  }

  async close() {
    throw new Error('close() must be implemented');
  }
}
