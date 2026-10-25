import { test, expect } from '../../src/fixtures/index.js';

/**
 * Onboarding: a new owner is prompted, the wizard opens, and once the property
 * exists the dashboard + inmates tab reflect it.
 */
test.describe('@e2e Onboarding', () => {
  test('E2E-ONB-01 new owner sees the setup prompt', async ({ ownerApp, dashboardPage }) => {
    await dashboardPage.expectSetupPrompt();
  });

  test('E2E-ONB-02 setup wizard opens from the prompt', async ({ ownerApp, dashboardPage }) => {
    await dashboardPage.expectSetupPrompt();
    await dashboardPage.startSetup();
    await dashboardPage.expectNoErrorPage();
    expect((await dashboardPage.text()).length).toBeGreaterThan(20);
  });

  test('E2E-ONB-03 property + rooms appear on the dashboard and inmates tab', async ({ hostelApp, hostel, dashboardPage, inmatesPage }) => {
    await dashboardPage.expectOwnerDashboard(hostel.property.name);
    await inmatesPage.open();
    await inmatesPage.expectLoaded(hostel.property.name);
    await inmatesPage.expectRoomsSection();
  });
});
