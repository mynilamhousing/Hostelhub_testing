import { BasePage } from '../core/base.page.js';
import { LABELS, TIMEOUTS } from '../config/constants.js';

/** Sign-up screen (owner or resident account). */
export class RegisterPage extends BasePage {
  async expectLoaded() {
    await this.expectText(/create account|sign up|register/i, TIMEOUTS.text);
    await this.expectNoErrorPage();
  }

  async fill({ name, phone, email, username, password }) {
    if (name) await this.fillField(LABELS.fullName, name);
    if (phone) await this.fillField(LABELS.phone, phone);
    if (email) await this.fillField('Email', email);
    if (username) await this.fillField(LABELS.username, username);
    if (password) await this.fillField(LABELS.password, password);
  }
}
