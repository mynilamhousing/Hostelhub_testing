import { test, expect } from '../../src/fixtures/index.js';
import { ROUTES, TEXT } from '../../src/config/constants.js';
import { goToRoute } from '../../src/core/flutter.driver.js';

/**
 * Session + routing regression — session persistence, guards on every protected
 * route, and the sign-out path (lazy list scrolling included).
 */
test.describe('@regression Session and routing', () => {
  test('REG-SES-01 session survives a page reload', async ({ hostelApp, hostel, dashboardPage }) => {
    await dashboardPage.expectOwnerDashboard(hostel.property.name);
    await dashboardPage.reload(); // semantics must be re-enabled after reload
    await dashboardPage.expectRoute('/home');
    await dashboardPage.expectOwnerDashboard(hostel.property.name);
  });

  test('REG-SES-02 empty credentials do not navigate', async ({ app, loginPage }) => {
    await loginPage.expectLoaded();
    await loginPage.submit();
    await app.waitForTimeout(1500);
    await loginPage.expectRoute('/login');
  });

  test('REG-SES-03 every protected route redirects to login when signed out', async ({ app }) => {
    for (const route of [ROUTES.expenses, ROUTES.complaints, ROUTES.documents, ROUTES.settings, ROUTES.bills]) {
      await goToRoute(app, route);
      await app.waitForTimeout(1200);
      expect(new URL(app.url()).hash, `${route} should redirect to /login`).toContain('/login');
    }
  });

  test('REG-SES-04 logout clears the session', async ({ hostelApp, hostel, authFlow, loginPage }) => {
    await authFlow.signOut();
    await loginPage.expectText(TEXT.loginHeading);

    await hostelApp.reload();
    await loginPage.expectRoute('/login');
  });
});
