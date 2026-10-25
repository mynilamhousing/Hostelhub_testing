import { expect } from '@playwright/test';
import { BasePage } from '../core/base.page.js';
import { LABELS, TEXT, TIMEOUTS } from '../config/constants.js';

/** Login screen — entry point for every authenticated journey. */
export class LoginPage extends BasePage {
  get usernameField() { return this.byLabel(LABELS.username); }
  get passwordField() { return this.byLabel(LABELS.password); }
  get submitButton() { return this.byRoleButton(LABELS.login); }
  get signUpButton() { return this.byRoleButton(LABELS.signUp); }
  get forgotPasswordButton() { return this.byRoleButton(LABELS.forgotPassword); }

  async expectLoaded() {
    await expect(this.usernameField).toBeVisible({ timeout: TIMEOUTS.text });
    await expect(this.submitButton).toBeVisible();
    await this.expectText(TEXT.loginHeading);
  }

  async fillCredentials(username, password) {
    await this.fillField(LABELS.username, username);
    await this.fillField(LABELS.password, password);
  }

  async submit() {
    await this.submitButton.click();
    await this.page.waitForTimeout(TIMEOUTS.uiSettle);
  }

  /** Full sign-in; resolves once the shell is rendered. */
  async login(username, password) {
    await this.fillCredentials(username, password);
    await this.submit();
    await this.expectRoute('/home');
  }

  async expectInvalidCredentials() {
    await this.expectText(TEXT.loginFailed);
    await this.expectRoute('/login');
  }

  async openSignUp() {
    await this.signUpButton.click();
    await this.page.waitForTimeout(TIMEOUTS.uiSettle);
  }

  async openForgotPassword() {
    await this.forgotPasswordButton.click();
    await this.page.waitForTimeout(TIMEOUTS.uiSettle);
  }
}
