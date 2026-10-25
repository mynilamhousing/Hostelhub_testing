/**
 * Flows — business journeys composed from page objects.
 *
 * A flow answers "how does a user accomplish X end to end"; page objects answer
 * "how do I interact with a screen". Tests call flows, so a UI change touches
 * one page object, and a process change touches one flow.
 */
import { LoginPage } from '../pages/login.page.js';
import { MorePage } from '../pages/more.page.js';
import { InmatesPage } from '../pages/inmates.page.js';

export class AuthFlow {
  constructor(page) {
    this.page = page;
    this.loginPage = new LoginPage(page);
    this.morePage = new MorePage(page);
  }

  /** Sign in and wait for the shell. */
  async signIn(owner) {
    await this.loginPage.expectLoaded();
    await this.loginPage.login(owner.username, owner.password);
    return this;
  }

  /** Sign in expecting failure; returns the error assertion. */
  async signInWithInvalidPassword(owner, wrongPassword = 'WrongPass!1') {
    await this.loginPage.expectLoaded();
    await this.loginPage.fillCredentials(owner.username, wrongPassword);
    await this.loginPage.submit();
    await this.loginPage.expectInvalidCredentials();
  }

  async signOut() {
    await this.morePage.open();
    await this.morePage.logout();
    await this.loginPage.expectLoaded();
  }
}

export class InmateFlow {
  constructor(page) {
    this.page = page;
    this.inmatesPage = new InmatesPage(page);
  }

  /** Adds a resident through the UI and returns the data used. */
  async addResident({ roomNo, inmate }) {
    await this.inmatesPage.open();
    const form = await this.inmatesPage.addInmate();
    await form.expectLoaded();
    await form.selectRoom(roomNo);
    await form.fill({
      name: inmate.name,
      phone: inmate.phone,
      email: inmate.email,
      bedNo: inmate.bed_no,
      rent: inmate.rent_amount,
      dueDay: inmate.due_day,
    });
    await form.save();
    const credentials = await form.readGeneratedCredentials();
    await form.dialog.dismiss();
    return { ...inmate, credentials };
  }
}
