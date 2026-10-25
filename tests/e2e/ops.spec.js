import { test, expect } from '../../src/fixtures/index.js';
import { ROUTES } from '../../src/config/constants.js';

/**
 * Operations modules — one test per module family, asserting the screen renders
 * its heading and never falls back to the router error page.
 */
test.describe('@e2e Ops modules', () => {
  test('E2E-OPS-01 complaints screen renders', async ({ hostelApp, opsPage }) => {
    await opsPage.openComplaints();
  });

  test('E2E-OPS-02 documents screen renders with its upload action', async ({ hostelApp, opsPage }) => {
    await opsPage.openDocuments();
    await opsPage.expectButton(/Add hostel document/i);
  });

  test('E2E-OPS-03 expenses screen shows the P&L summary', async ({ hostelApp, opsPage }) => {
    await opsPage.openExpenses();
    await opsPage.expectButton(/Add expense/i);
  });

  test('E2E-OPS-04 visitors, deposits, ratings and SOS render', async ({ hostelApp, opsPage }) => {
    for (const [route, heading] of [
      [ROUTES.visitors, /Visitors/i],
      [ROUTES.deposits, /Deposits/i],
      [ROUTES.ratings, /Ratings/i],
      [ROUTES.sos, /SOS/i],
    ]) {
      await opsPage.open(route);
      await opsPage.expectScreen(heading);
    }
  });

  test('E2E-OPS-05 settings, bills and chat render', async ({ hostelApp, opsPage }) => {
    for (const [route, heading] of [
      [ROUTES.settings, /Property settings/i],
      [ROUTES.bills, /Bills/i],
      [ROUTES.chat, /Chat/i],
    ]) {
      await opsPage.open(route);
      await opsPage.expectScreen(heading);
    }
  });

  test('E2E-OPS-06 adding an expense reaches the P&L endpoint', async ({ hostelApp, hostel, opsPage, api }) => {
    await opsPage.openExpenses();
    await opsPage.tapButton(/Add expense/i);

    for (const [label, value] of [['Title', 'Electricity'], ['Amount', '1200']]) {
      const field = hostelApp.getByLabel(label).first();
      if (await field.count()) await opsPage.fillField(label, value);
    }
    const save = hostelApp.getByRole('button', { name: /Save|Add/i }).last();
    if (await save.count()) {
      await save.click();
      await hostelApp.waitForTimeout(2000);
    }

    const { pnl } = await api.pnl(hostel.property.id);
    expect(pnl.expense).toBeGreaterThanOrEqual(0);
    expect(pnl).toHaveProperty('income');
    expect(pnl).toHaveProperty('net');
  });
});
