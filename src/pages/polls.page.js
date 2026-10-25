import { BasePage } from '../core/base.page.js';
import { BottomNav } from '../components/bottom-nav.component.js';
import { TABS } from '../config/constants.js';

/** Mess-polls tab: today's poll, response counts, creation entry point. */
export class PollsPage extends BasePage {
  constructor(page) {
    super(page);
    this.nav = new BottomNav(page);
  }

  async open() {
    await this.nav.open(TABS.polls);
  }

  async expectPollVisible(mealOrQuestion) {
    await this.expectText(mealOrQuestion instanceof RegExp ? mealOrQuestion : new RegExp(mealOrQuestion, 'i'));
    await this.expectNoErrorPage();
  }
}
