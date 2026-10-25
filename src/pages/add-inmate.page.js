import { expect } from '@playwright/test';
import { BasePage } from '../core/base.page.js';
import { DialogComponent } from '../components/dialog.component.js';
import { LABELS, TIMEOUTS } from '../config/constants.js';

/**
 * Add-inmate form.
 * Room selection is a chip button labelled "Room <no> (<occupied>/<capacity>)".
 */
export class AddInmatePage extends BasePage {
  constructor(page) {
    super(page);
    this.dialog = new DialogComponent(page);
  }

  get submitButton() { return this.byRoleButton(LABELS.addInmate); }

  async expectLoaded() {
    await expect(this.submitButton).toBeVisible({ timeout: TIMEOUTS.text });
    await expect(this.byLabel(LABELS.fullName)).toBeVisible();
  }

  async selectRoom(roomNo) {
    const chip = this.page.getByRole('button', { name: new RegExp(`Room\\s+${roomNo}\\b`) }).first();
    await expect(chip, `room chip for ${roomNo} should exist`).toBeVisible({ timeout: TIMEOUTS.text });
    await chip.click();
    await this.page.waitForTimeout(500);
  }

  async fill({ name, phone, email, bedNo, rent, dueDay }) {
    if (name !== undefined) await this.fillField(LABELS.fullName, name);
    if (phone !== undefined) await this.fillField(LABELS.phone, phone);
    if (email !== undefined) await this.fillField(LABELS.email, email);
    if (bedNo !== undefined) await this.fillField(LABELS.bedNo, bedNo);
    if (rent !== undefined) await this.fillField(LABELS.rent, rent);
    if (dueDay !== undefined) await this.fillField(LABELS.dueDay, dueDay);
  }

  /** Submits and waits for the confirmation dialog (server-generated credentials). */
  async save() {
    await this.submitButton.click();
    await this.page.waitForTimeout(2500);
  }

  /** Credentials are generated server-side and shown once after creation. */
  async readGeneratedCredentials() {
    const text = await this.text();
    return {
      username: text.match(/username[:\s]*([a-z0-9]+)/i)?.[1],
      password: text.match(/password[:\s]*([A-Za-z0-9!@#$%^&*]+)/i)?.[1],
      raw: text,
    };
  }
}
