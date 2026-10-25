/**
 * Authentication screens — platform-neutral.
 * They only use the UiDriver contract, so the same class works on web,
 * Android and iOS.
 */
import { LABELS, TEXT, TIMEOUTS } from '../config/constants.js';

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
}

export class LoginScreen extends BaseScreen {
  async expectLoaded() {
    await this.waitFor(TEXT.loginHeading);
    if (!(await this.driver.exists(LABELS.login))) {
      throw new Error('Login screen did not render the "Log in" button');
    }
  }

  async fillCredentials({ username, password }) {
    await this.driver.fill(LABELS.username, username);
    await this.driver.fill(LABELS.password, password);
  }

  async submit() {
    await this.driver.tap(LABELS.login);
  }

  /** Signs in and waits for the shell to appear. */
  async login(owner) {
    await this.expectLoaded();
    await this.fillCredentials(owner);
    await this.submit();
    await this.waitFor(/Inmates|Occupancy|Set up your hostel|Quick actions/, 30_000);
  }

  async expectInvalidCredentials() {
    await this.waitFor(TEXT.loginFailed);
  }

  async openSignUp() {
    await this.driver.tap(LABELS.signUp);
  }

  async openForgotPassword() {
    await this.driver.tap(LABELS.forgotPassword);
  }
}

export class RegisterScreen extends BaseScreen {
  async expectLoaded() {
    await this.waitFor(/create account|sign up|register/i);
  }
}

export class ForgotPasswordScreen extends BaseScreen {
  async expectLoaded() {
    await this.waitFor(/forgot|reset/i);
  }
}
