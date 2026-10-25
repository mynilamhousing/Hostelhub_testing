import { test, expect } from '../../src/fixtures/index.js';

/**
 * Smoke suite — the deploy gate. Fast, must-never-break paths only.
 * Run on every deployment: `npm run test:smoke`.
 */
test.describe('@smoke HostelHub smoke', () => {
  test('SMK-01 API health endpoint responds', async ({ api }) => {
    await expect.poll(async () => (await api.health()).status).toBe('ok');
  });

  test('SMK-02 app loads and shows the login screen', async ({ app, loginPage }) => {
    await loginPage.expectLoaded();
  });

  test('SMK-03 owner signs in and sees the dashboard', async ({ hostelApp, hostel, dashboardPage }) => {
    await dashboardPage.expectOwnerDashboard(hostel.property.name);
    await dashboardPage.expectStatCards();
  });

  test('SMK-04 owner tabs are all reachable', async ({ hostelApp, hostel, dashboardPage, inmatesPage, pollsPage }) => {
    await dashboardPage.expectOwnerDashboard(hostel.property.name);

    await inmatesPage.open();
    await inmatesPage.expectLoaded(hostel.property.name);

    await pollsPage.open();
    await pollsPage.expectNoErrorPage();

    await dashboardPage.openTab('Home');
    await dashboardPage.expectOwnerShell();
  });

  test('SMK-05 seeded resident is listed on the inmates tab', async ({ hostelApp, hostel, inmatesPage }) => {
    const inmate = await hostel.addInmate();
    await inmatesPage.reload(); // provider cache: refresh after API seeding
    await inmatesPage.open();
    await inmatesPage.expectInmateListed(inmate.name);
  });
});
