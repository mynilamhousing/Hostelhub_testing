import { expect } from '@playwright/test';
import { BasePage } from '../core/base.page.js';
import { BottomNav } from '../components/bottom-nav.component.js';
import { LABELS, TABS, TIMEOUTS } from '../config/constants.js';
import { AddInmatePage } from './add-inmate.page.js';

/** Inmates tab: rooms grid, resident list, entry point to the add-inmate form. */
export class InmatesPage extends BasePage {
  constructor(page) {
    super(page);
    this.nav = new BottomNav(page);
  }

  get addInmateButton() { return this.byRoleButton(LABELS.addInmate); }
  get addRoomButton() { return this.byRoleButton(/Add room/i); }

  async open() {
    await this.nav.open(TABS.inmates);
  }

  async expectLoaded(propertyName) {
    await expect(this.addInmateButton).toBeVisible({ timeout: TIMEOUTS.text });
    if (propertyName) await this.expectText(propertyName);
  }

  /** Room cards are canvas-drawn without semantics; the section is verified via
   *  the "Add room" affordance, and room numbers via the add-inmate chips. */
  async expectRoomsSection() {
    await expect(this.addRoomButton).toBeVisible({ timeout: TIMEOUTS.text });
    await this.expectText(/Rooms/);
  }

  async expectInmateListed(name) {
    await this.expectText(name);
  }

  async addInmate() {
    await this.addInmateButton.click();
    await this.page.waitForTimeout(TIMEOUTS.uiSettle);
    return new AddInmatePage(this.page);
  }
}
