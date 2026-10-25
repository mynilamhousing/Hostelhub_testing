/**
 * Bottom navigation — shared by every authenticated screen.
 * A component (not a page) because it belongs to the app shell, not to a route.
 */
import { expect } from '@playwright/test';
import { TIMEOUTS } from '../config/constants.js';

export class BottomNav {
  constructor(page) {
    this.page = page;
  }

  tab(name) {
    return this.page.getByRole('button', { name, exact: true });
  }

  async open(name) {
    await this.tab(name).click();
    await this.page.waitForTimeout(TIMEOUTS.uiSettle);
  }

  async expectVisible(...names) {
    for (const name of names) {
      await expect(this.tab(name), `tab "${name}" should be visible`).toBeVisible({
        timeout: TIMEOUTS.text,
      });
    }
  }

  async expectActive(name) {
    await expect(this.tab(name)).toBeVisible();
  }
}
