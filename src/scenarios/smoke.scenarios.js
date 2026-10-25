/**
 * Smoke scenarios — the deploy gate, defined once and executed on every
 * platform (web, Android emulator, iOS simulator).
 *
 * Every scenario receives:
 *   ctx.driver   – UiDriver implementation for the current platform
 *   ctx.screens  – screen objects bound to that driver
 *   ctx.api      – REST client for setup/verification
 *   ctx.tenant   – populated when `prepare` asks for one
 *
 * Rules: no platform checks, no selectors, no sleeps. If a scenario needs
 * something a platform cannot do, that belongs in the driver, not here.
 */
import { assert, assertMatch } from '../support/assert.js';
import { provisionTenant } from '../fixtures/tenant.js';

export const smokeScenarios = [
  {
    id: 'SMK-01',
    title: 'API health endpoint responds',
    tags: ['smoke', 'api'],
    prepare: async () => {},
    run: async ({ api }) => {
      const health = await api.health();
      assert(health.status === 'ok', `health endpoint returned ${JSON.stringify(health)}`);
    },
  },
  {
    id: 'SMK-02',
    title: 'App starts and shows the login screen',
    tags: ['smoke'],
    prepare: async () => {},
    run: async ({ screens }) => {
      await screens.login.expectLoaded();
    },
  },
  {
    id: 'SMK-03',
    title: 'Owner signs in and sees the dashboard',
    tags: ['smoke'],
    prepare: async (ctx) => {
      ctx.tenant = await provisionTenant();
    },
    run: async ({ screens, tenant }) => {
      await screens.login.login(tenant.owner);
      await screens.dashboard.expectReady(tenant.property.name);
      await screens.dashboard.expectKpiCards();
    },
  },
  {
    id: 'SMK-04',
    title: 'Owner tabs are all reachable',
    tags: ['smoke'],
    prepare: async (ctx) => {
      ctx.tenant = await provisionTenant();
    },
    run: async ({ screens, tenant }) => {
      await screens.login.login(tenant.owner);
      await screens.dashboard.expectReady(tenant.property.name);

      await screens.inmates.open();
      await screens.inmates.expectLoaded(tenant.property.name);

      await screens.polls.open();
      await screens.dashboard.openTab('Home');
    },
  },
  {
    id: 'SMK-05',
    title: 'Seeded resident is listed on the inmates tab',
    tags: ['smoke'],
    prepare: async (ctx) => {
      ctx.tenant = await provisionTenant();
      ctx.inmate = await ctx.tenant.addInmate();
    },
    run: async ({ screens, tenant, inmate }) => {
      await screens.login.login(tenant.owner);
      await screens.inmates.open();
      const text = await screens.inmates.text;
      assertMatch(text, inmate.name, 'inmates list should contain the seeded resident');
    },
  },
];
