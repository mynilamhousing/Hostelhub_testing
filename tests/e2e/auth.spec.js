import { test } from '../../src/fixtures/index.js';
import { ROUTES, TEXT } from '../../src/config/constants.js';
import { goToRoute } from '../../src/core/flutter.driver.js';

/**
 * Authentication end-to-end: login, failure path, sign-up and reset entry
 * points, sign-out and the route guard.
 */
test.describe('@e2e Authentication', () => {
  test('E2E-AUTH-01 owner signs in with valid credentials', async ({ hostelApp, hostel, dashboardPage }) => {
    // ownerApp already signed in through the UI — assert the resulting screen.
    await dashboardPage.expectOwnerDashboard(hostel.property.name);
    await dashboardPage.expectRoute('/home');
  });

  test('E2E-AUTH-02 invalid password keeps the user on the login screen', async ({ app, owner, authFlow, loginPage }) => {
    await authFlow.signInWithInvalidPassword(owner);
    await loginPage.expectRoute('/login');
  });

  test('E2E-AUTH-03 sign-up screen opens from login', async ({ app, loginPage, registerPage }) => {
    await loginPage.expectLoaded();
    await loginPage.openSignUp();
    await registerPage.expectLoaded();
  });

  test('E2E-AUTH-04 forgot-password screen opens from login', async ({ app, loginPage, forgotPasswordPage }) => {
    await loginPage.expectLoaded();
    await loginPage.openForgotPassword();
    await forgotPasswordPage.expectLoaded();
  });

  test('E2E-AUTH-05 protected route redirects to login when signed out', async ({ app, loginPage }) => {
    await goToRoute(app, ROUTES.expenses);
    await app.waitForTimeout(2000);
    await loginPage.expectLoaded();
    await loginPage.expectRoute('/login');
  });

  test('E2E-AUTH-06 owner can sign out', async ({ hostelApp, hostel, dashboardPage, authFlow, loginPage }) => {
    await dashboardPage.expectOwnerDashboard(hostel.property.name);
    await authFlow.signOut();
    await loginPage.expectText(TEXT.loginHeading);
  });
});
