import { expect } from '@playwright/test';
import { BasePage } from '../core/base.page.js';
import { BottomNav } from '../components/bottom-nav.component.js';
import { LABELS, TABS, TIMEOUTS } from '../config/constants.js';

/** "More" hub: every operations module plus account actions. */
export class MorePage extends BasePage {
  constructor(page) {
    super(page);
    this.nav = new BottomNav(page);
  }

  get logoutButton() { return this.byRoleButton(new RegExp(LABELS.logout, 'i')); }

  async open() {
    await this.nav.open(TABS.more);
    await this.page.waitForTimeout(1200); // lazy ListView settles
  }

  async expectMenuItems(...items) {
    for (const item of items) {
      await expect(this.byRoleButton(item), `menu item "${item}"`).toBeVisible({ timeout: TIMEOUTS.text });
    }
  }

  /** Log out lives at the bottom of a lazy list — scroll it into view first. */
  async logout() {
    await this.scrollToFind(this.logoutButton, 4, 900);
    await expect(this.logoutButton).toBeVisible({ timeout: TIMEOUTS.text });
    await this.logoutButton.click();
    await this.page.waitForTimeout(2500);
  }
}
