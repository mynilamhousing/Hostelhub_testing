import { BasePage } from '../core/base.page.js';
import { TIMEOUTS } from '../config/constants.js';

/** Password-reset request screen. */
export class ForgotPasswordPage extends BasePage {
  get emailField() { return this.byLabel(/email/i); }

  async expectLoaded() {
    await this.expectText(/forgot|reset/i, TIMEOUTS.text);
    await this.expectNoErrorPage();
  }

  async requestReset(email) {
    await this.fillField(/email/i, email);
    const submit = this.byRoleButton(/Send|Reset|Continue/i);
    if (await submit.count()) {
      await submit.first().click();
      await this.page.waitForTimeout(2500);
    }
  }
}
