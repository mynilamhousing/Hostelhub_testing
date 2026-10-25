/**
 * Native driver helpers (Appium / WebdriverIO).
 *
 * Flutter publishes its Semantics labels to the platform accessibility layer, so
 * the selectors here mirror the web ones (`~Label` = content-desc / accessibility
 * id). That keeps flows readable and consistent across the two layers.
 */
export const SELECTORS = Object.freeze({
  username: '~Username',
  password: '~Password',
  loginButton: '~Log in',
  signUp: '~Sign up',
  tabHome: '~Home',
  tabInmates: '~Inmates',
  tabPolls: '~Polls',
  tabMore: '~More',
});

/** Waits until any of the given strings appears in the page source. */
export async function waitForAnyText(texts, timeout = 60_000) {
  const needles = Array.isArray(texts) ? texts : [texts];
  await browser.waitUntil(
    async () => {
      const source = await browser.getPageSource();
      return needles.some((t) => source.includes(t));
    },
    { timeout, timeoutMsg: `none of these appeared: ${needles.join(' | ')}` },
  );
}

export async function login(owner) {
  const username = await $(SELECTORS.username);
  await username.waitForDisplayed({ timeout: 60_000 });
  await username.click();
  await username.setValue(owner.username);

  const password = await $(SELECTORS.password);
  await password.click();
  await password.setValue(owner.password);

  await $(SELECTORS.loginButton).click();
  await waitForAnyText(['Quick actions', 'Occupancy']);
}

export async function openTab(label) {
  const tab = await $(`~${label}`);
  await tab.waitForDisplayed({ timeout: 20_000 });
  await tab.click();
  await browser.pause(1200);
}
