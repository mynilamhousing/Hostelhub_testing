/**
 * Flutter web driver.
 *
 * HostelHub web renders into <canvas>, so Playwright's DOM selectors find
 * nothing. Flutter exposes an accessibility (semantics) tree once its
 * placeholder is activated; after that the whole UI is queryable with standard
 * role/label locators.
 *
 * Everything Flutter-specific lives here so page objects stay declarative.
 */
import { TIMEOUTS } from '../config/constants.js';

/** Waits until Flutter attached its view to the DOM. */
export async function waitForFlutter(page, timeout = TIMEOUTS.appBoot) {
  await page.waitForSelector('flt-glass-pane, flutter-view, flt-scene-host', { timeout });
}

/** Activates the semantics tree (idempotent). Must run before any interaction. */
export async function enableSemantics(page) {
  const alreadyOn = await page.evaluate(
    () => (document.querySelector('flt-semantics-host')?.children.length ?? 0) > 0,
  );
  if (alreadyOn) return;

  await page.evaluate(() => document.querySelector('flt-semantics-placeholder')?.click());
  await page.waitForTimeout(600);

  const enabled = await page.evaluate(
    () => (document.querySelector('flt-semantics-host')?.children.length ?? 0) > 0,
  );
  if (!enabled) {
    // One more frame — the placeholder is sometimes injected late.
    await page.waitForTimeout(1200);
    await page.evaluate(() => document.querySelector('flt-semantics-placeholder')?.click());
    await page.waitForTimeout(600);
  }
}

/** Opens the app and prepares it for interaction. */
export async function openApp(page, baseUrl, route = '') {
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'load', timeout: 60_000 });
  await waitForFlutter(page);
  await enableSemantics(page);
  await page.waitForTimeout(TIMEOUTS.uiSettle);
}

/** Full reload; semantics must be re-enabled afterwards. */
export async function reloadApp(page) {
  await page.reload({ waitUntil: 'load' });
  await waitForFlutter(page);
  await enableSemantics(page);
  await page.waitForTimeout(2500);
}

/** Visible text of the accessibility tree, whitespace-collapsed. */
export async function appText(page) {
  return (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').trim();
}

/** SPA hash navigation (page.goto would reload and lose session state). */
export async function goToRoute(page, route) {
  await page.evaluate((r) => {
    window.location.hash = r.startsWith('#') ? r : `#${r}`;
  }, route);
  await page.waitForTimeout(TIMEOUTS.uiSettle);
}

/** Current hash route, e.g. "/home". */
export function currentRoute(page) {
  return new URL(page.url()).hash.replace(/^#/, '') || '';
}
