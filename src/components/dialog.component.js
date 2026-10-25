/**
 * Modal dialog / bottom-sheet helper.
 * Flutter dialogs are rendered in the same canvas, so they are read through the
 * semantics tree like any other screen.
 */
import { expect } from '@playwright/test';
import { appText } from '../core/flutter.driver.js';
import { TIMEOUTS } from '../config/constants.js';

export class DialogComponent {
  constructor(page) {
    this.page = page;
  }

  async text() {
    return appText(this.page);
  }

  async expectContains(matcher) {
    await expect
      .poll(() => this.text(), { timeout: TIMEOUTS.text, message: `dialog should contain ${matcher}` })
      .toMatch(matcher);
  }

  /** Clicks the first matching action button inside the dialog. */
  async press(name) {
    const button = this.page.getByRole('button', { name });
    await button.first().click();
    await this.page.waitForTimeout(TIMEOUTS.uiSettle);
  }

  /** Dismisses with whichever confirmation affordance the dialog offers. */
  async dismiss() {
    for (const name of ['Done', 'OK', 'Close', 'Cancel']) {
      const button = this.page.getByRole('button', { name, exact: true });
      if (await button.count()) {
        await button.first().click();
        await this.page.waitForTimeout(TIMEOUTS.uiSettle);
        return true;
      }
    }
    return false;
  }
}
