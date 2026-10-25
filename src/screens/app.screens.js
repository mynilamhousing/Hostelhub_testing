/**
 * Application screens (post-login) — platform-neutral.
 *
 * Navigation rule: tabs are always tapped. Deep routes are used only when the
 * driver supports them (`supportsRoutes`), which is web only; on native the same
 * screen is reached through the More menu. That keeps one scenario valid
 * everywhere.
 */
import { LABELS, ROUTES, TABS, TEXT, TIMEOUTS } from '../config/constants.js';

class BaseScreen {
  constructor(driver) {
    this.driver = driver;
  }

  get text() {
    return this.driver.text();
  }

  async waitFor(matcher, timeout = TIMEOUTS.text) {
    await this.driver.waitForText(matcher, timeout);
  }

  async noErrorPage() {
    const text = await this.text;
    if (text.includes(TEXT.pageNotFound)) {
      throw new Error('Router fell back to "Page Not Found"');
    }
  }
}

export class DashboardScreen extends BaseScreen {
  async expectReady(propertyName) {
    await this.waitFor(new RegExp(propertyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 30_000);
    for (const tab of [TABS.home, TABS.inmates, TABS.more]) {
      if (!(await this.driver.exists(tab))) {
        throw new Error(`Dashboard is missing the "${tab}" tab`);
      }
    }
  }

  async expectKpiCards() {
    await this.waitFor(/Inmates/);
    const text = await this.text;
    for (const label of ['Occupancy', 'Rooms', 'Pending dues']) {
      if (!text.includes(label)) throw new Error(`Dashboard is missing the "${label}" card`);
    }
  }

  async expectSetupPrompt() {
    await this.waitFor(TEXT.setupPrompt, 30_000);
  }

  async startSetup() {
    await this.driver.tap(/Get started/i);
  }

  async openTab(name) {
    await this.driver.tapTab(name);
  }
}

export class InmatesScreen extends BaseScreen {
  async open() {
    await this.driver.tapTab(TABS.inmates);
  }

  async expectLoaded(propertyName) {
    await this.waitFor(new RegExp(propertyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 30_000);
    if (!(await this.driver.exists(LABELS.addInmate))) {
      throw new Error('Inmates screen did not render "Add inmate"');
    }
  }

  async expectInmate(name) {
    await this.waitFor(name, 20_000);
  }

  async openAddInmate() {
    await this.driver.tap(LABELS.addInmate);
  }
}

export class AddInmateScreen extends BaseScreen {
  async expectLoaded() {
    await this.waitFor(new RegExp(LABELS.addInmate), 20_000);
  }

  async selectRoom(roomNo) {
    await this.driver.tap(new RegExp(`Room\\s+${roomNo}\\b`));
  }

  async fill({ name, phone, email, bedNo, rent, dueDay }) {
    if (name !== undefined) await this.driver.fill(LABELS.fullName, name);
    if (phone !== undefined) await this.driver.fill(LABELS.phone, phone);
    if (email !== undefined) await this.driver.fill(LABELS.email, email);
    if (bedNo !== undefined) await this.driver.fill(LABELS.bedNo, bedNo);
    if (rent !== undefined) await this.driver.fill(LABELS.rent, rent);
    if (dueDay !== undefined) await this.driver.fill(LABELS.dueDay, dueDay);
  }

  /**
   * Submits the form. The server generates the resident's credentials and the
   * app shows them once in a dialog, which must be dismissed before navigating
   * back to the list.
   */
  async save() {
    await this.driver.tap(LABELS.addInmate);

    // After a successful create the app either shows the generated credentials
    // in a dialog or returns straight to the list — handle both.
    await this.driver
      .waitForText(/password|No inmates yet|Room .* beds|Inmates/i, 25_000)
      .catch(() => {});

    for (const action of [/^Done$/, /^OK$/, /^Close$/]) {
      if (await this.driver.exists(action)) {
        await this.driver.tap(action);
        break;
      }
    }
  }
}

export class PollsScreen extends BaseScreen {
  async open() {
    await this.driver.tapTab(TABS.polls);
  }

  async expectPoll(matcher) {
    await this.waitFor(matcher instanceof RegExp ? matcher : new RegExp(matcher, 'i'));
    await this.noErrorPage();
  }
}

export class MoreScreen extends BaseScreen {
  async open() {
    await this.driver.tapTab(TABS.more);
  }

  async expectMenuItems(...items) {
    for (const item of items) {
      if (!(await this.driver.exists(item))) {
        throw new Error(`More menu is missing "${item}"`);
      }
    }
  }

  /** Log out sits at the bottom of a lazy list. */
  async logout() {
    for (let i = 0; i < 4 && !(await this.driver.exists(/Log out/i)); i += 1) {
      await this.driver.scrollDown();
    }
    await this.driver.tap(/Log out/i);
    await this.driver.waitForText(TEXT.loginHeading, 20_000);
  }
}

/**
 * Operations modules: complaints, expenses, documents, settings, bills…
 * Reached by route on web, through the More menu on native.
 */
export class OpsScreen extends BaseScreen {
  async open(route, menuLabel) {
    if (this.driver.supportsRoutes) {
      await this.driver.goRoute(route);
    } else {
      await this.driver.tapTab(TABS.more);
      await this.driver.tap(menuLabel);
    }
    await this.driver.waitForText(/./, TIMEOUTS.text);
  }

  async expectScreen(heading) {
    await this.waitFor(heading instanceof RegExp ? heading : new RegExp(heading, 'i'));
    await this.noErrorPage();
  }

  async expectButton(name) {
    if (!(await this.driver.exists(name))) {
      throw new Error(`Expected a "${name}" button on this screen`);
    }
  }

  async openComplaints() {
    await this.open(ROUTES.complaints, 'Complaints');
    await this.expectScreen(/Complaints/i);
  }

  async openExpenses() {
    await this.open(ROUTES.expenses, 'Expenses & P&L');
    await this.expectScreen(/Expenses & P&L/i);
  }

  async openDocuments() {
    await this.open(ROUTES.documents, 'Documents');
    await this.expectScreen(/Documents/i);
  }

  async openSettings() {
    await this.open(ROUTES.settings, 'Property settings');
    await this.expectScreen(/Property settings/i);
  }
}
