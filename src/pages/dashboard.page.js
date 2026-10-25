import { expect } from '@playwright/test';
import { BasePage } from '../core/base.page.js';
import { BottomNav } from '../components/bottom-nav.component.js';
import { TABS, TEXT, TIMEOUTS } from '../config/constants.js';

/** Owner dashboard (Home tab). */
export class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.nav = new BottomNav(page);
  }

  get getStartedButton() { return this.byRoleButton(/Get started/i); }

  async expectOwnerShell() {
    await this.nav.expectVisible(TABS.home, TABS.inmates, TABS.polls, TABS.more);
  }

  async expectOwnerDashboard(propertyName) {
    await this.expectOwnerShell();
    await this.expectText(propertyName);
  }

  async expectSetupPrompt() {
    await this.expectText(TEXT.setupPrompt);
    await expect(this.getStartedButton).toBeVisible({ timeout: TIMEOUTS.text });
  }

  async startSetup() {
    await this.getStartedButton.click();
    await this.page.waitForTimeout(TIMEOUTS.uiSettle);
  }

  /** Dashboard KPI cards: Inmates, Occupancy, Rooms, complaints, collections. */
  async expectStatCards() {
    const text = await this.text();
    for (const label of ['Inmates', 'Occupancy', 'Rooms', 'Pending dues']) {
      expect(text, `dashboard should show the "${label}" card`).toContain(label);
    }
  }

  async openTab(name) {
    await this.nav.open(name);
  }
}
