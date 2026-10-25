import { expect } from '@playwright/test';
import { BasePage } from '../core/base.page.js';
import { ROUTES, TEXT, TIMEOUTS } from '../config/constants.js';

/**
 * Operations screens that are pushed routes rather than tabs
 * (complaints, visitors, deposits, expenses, documents, settings, bills, SOS…).
 *
 * They share one page object because they share one contract: a route, a
 * heading, an empty state or a list, and never the router's error page.
 */
export class OpsPage extends BasePage {
  /** @param {string} route one of ROUTES */
  async open(route) {
    await this.goTo(route);
    await this.page.waitForTimeout(800);
  }

  async expectScreen(heading) {
    await this.expectText(heading, TIMEOUTS.text);
    await this.expectNoErrorPage();
  }

  async expectEmptyState(matcher = /no .* yet|nothing here/i) {
    await this.expectText(matcher);
  }

  async expectButton(name) {
    await expect(this.byRoleButton(name)).toBeVisible({ timeout: TIMEOUTS.text });
  }

  /** Some screens are gated until a property exists. */
  async expectSetupGate() {
    await this.expectText(TEXT.setupRequired);
  }

  async openExpenses() {
    await this.open(ROUTES.expenses);
    await this.expectScreen(/Expenses & P&L/i);
    await this.expectText(TEXT.pnlHeading);
  }

  async openDocuments() {
    await this.open(ROUTES.documents);
    await this.expectScreen(/Documents/i);
  }

  async openComplaints() {
    await this.open(ROUTES.complaints);
    await this.expectScreen(/Complaints/i);
  }

  async openSettings() {
    await this.open(ROUTES.settings);
    await this.expectScreen(/Property settings/i);
  }
}
