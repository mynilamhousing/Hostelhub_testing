/**
 * Web-only regression suite.
 *
 * Two families that only make sense against the browser + Worker:
 *   • API contract (auth codes, JSON types, tenant isolation) — runs without a UI;
 *   • session & routing (reload persistence, guards, deep links) — needs the SPA.
 *
 * Native builds have no URL router and no localStorage session, so these stay here.
 */
import { test, expect } from '@playwright/test';
import { PlaywrightDriver } from '../../src/drivers/playwright.driver.js';
import { makeScreens } from '../../src/screens/index.js';
import { assert, assertEqual, assertMatch } from '../../src/support/assert.js';
import { provisionTenant } from '../../src/fixtures/tenant.js';
import { dataFactory } from '../../src/fixtures/data.factory.js';
import { api } from '../../src/api/hostelhub.api.js';
import { ROUTES } from '../../src/config/constants.js';
import { env } from '../../src/config/env.js';

test.describe('@regression API contract', () => {
  test('REG-API-01 /health and /pricing keep their shape', async () => {
    assertEqual((await api.health()).status, 'ok', 'health endpoint');

    const { pricing } = await api.pricing();
    for (const key of ['monthly', 'yearly', 'extra_property']) {
      assertEqual(typeof pricing.global[key], 'number', `pricing.global.${key}`);
    }
  });

  test('REG-API-02 register and login issue a signed JWT', async () => {
    const user = dataFactory.owner();
    const registered = await api.register(user);

    assertEqual(registered.user.username, user.username, 'registered username');
    assert(!('password' in registered.user), 'user payload must never contain the password');
    assertEqual(registered.token.split('.').length, 3, 'token should be a three-part JWT');

    const loggedIn = await api.login(user.username, user.password);
    assertEqual(loggedIn.user.id, registered.user.id, 'login should return the same user');
  });

  test('REG-API-03 wrong password is 401 and never echoes the password', async () => {
    const user = dataFactory.owner();
    await api.register(user);

    const { status, body } = await api.raw('POST', '/auth/login', {
      username: user.username,
      password: 'WrongPass!1',
    });
    assertEqual(status, 401, 'wrong password status');
    assert(!JSON.stringify(body).includes(user.password), 'error body must not echo the password');
  });

  test('REG-API-04 duplicate username is rejected', async () => {
    const user = dataFactory.owner();
    await api.register(user);
    const { status } = await api.raw('POST', '/auth/register', { ...dataFactory.owner(), username: user.username });
    assert([400, 409].includes(status), `duplicate username should be 400/409, got ${status}`);
  });

  test('REG-API-05 boolean fields are real JSON booleans', async () => {
    const { user } = await api.register(dataFactory.owner());
    assertEqual(typeof user.kyc_verified, 'boolean', 'kyc_verified type');
  });

  test('REG-API-06 tenants are isolated', async () => {
    const ownerA = await api.register(dataFactory.owner());
    const ownerB = await api.register(dataFactory.owner());

    const propertyA = (await api.createProperty(ownerA.user.id, dataFactory.property())).property;
    await api.createProperty(ownerB.user.id, dataFactory.property());

    const { properties } = await api.listProperties(ownerA.user.id);
    assertEqual(properties.length, 1, 'owner A should see exactly one property');
    assertEqual(properties[0].id, propertyA.id, 'owner A should see only their property');
  });
});

test.describe('@regression Session and routing', () => {
  test('REG-SES-01 session survives a reload', async ({ page }) => {
    const tenant = await provisionTenant();
    const driver = new PlaywrightDriver(page, { baseUrl: env.webBaseUrl });
    const screens = makeScreens(driver);

    await driver.start();
    await screens.login.login(tenant.owner);
    await screens.dashboard.expectReady(tenant.property.name);

    await driver.restart();
    await screens.dashboard.expectReady(tenant.property.name);
  });

  test('REG-SES-02 empty credentials do not navigate', async ({ page }) => {
    const driver = new PlaywrightDriver(page, { baseUrl: env.webBaseUrl });
    const screens = makeScreens(driver);

    await driver.start();
    await screens.login.expectLoaded();
    await screens.login.submit();
    await page.waitForTimeout(1500);
    assertMatch(page.url(), '/login', 'route should stay on login');
  });

  test('REG-SES-03 protected routes redirect to login when signed out', async ({ page }) => {
    const driver = new PlaywrightDriver(page, { baseUrl: env.webBaseUrl });
    await driver.start();

    for (const route of [ROUTES.expenses, ROUTES.complaints, ROUTES.documents, ROUTES.settings]) {
      await driver.goRoute(route);
      assertMatch(page.url(), '/login', `${route} should redirect to login`);
    }
  });

  test('REG-SES-04 logout clears the persisted session', async ({ page }) => {
    const tenant = await provisionTenant();
    const driver = new PlaywrightDriver(page, { baseUrl: env.webBaseUrl });
    const screens = makeScreens(driver);

    await driver.start();
    await screens.login.login(tenant.owner);
    await screens.more.open();
    await screens.more.logout();

    await driver.restart();
    assertMatch(await driver.text(), /Welcome back/i, 'login screen expected after logout + reload');
  });
});
