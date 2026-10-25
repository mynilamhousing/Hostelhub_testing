/**
 * E2E scenarios — user journeys that carry real risk, defined once and executed
 * on web, Android emulator and iOS simulator.
 *
 * Kept platform-neutral: navigation goes through taps (tabs/menu), not routes,
 * so the same steps are valid on all three runners.
 */
import { assert, assertMatch } from '../support/assert.js';
import { provisionTenant } from '../fixtures/tenant.js';
import { dataFactory } from '../fixtures/data.factory.js';

const loginWithTenant = async (ctx) => {
  ctx.tenant = await provisionTenant();
};

export const e2eScenarios = [
  // ── Authentication ────────────────────────────────────────────────────────
  {
    id: 'E2E-AUTH-01',
    title: 'Owner signs in with valid credentials',
    tags: ['e2e', 'auth'],
    prepare: async (ctx) => {
      ctx.tenant = await provisionTenant();
    },
    run: async ({ screens, tenant }) => {
      await screens.login.login(tenant.owner);
      await screens.dashboard.expectReady(tenant.property.name);
    },
  },
  {
    id: 'E2E-AUTH-02',
    title: 'Invalid password is rejected',
    tags: ['e2e', 'auth'],
    prepare: async (ctx) => {
      ctx.tenant = await provisionTenant({ withProperty: false });
    },
    run: async ({ screens, tenant }) => {
      await screens.login.expectLoaded();
      await screens.login.fillCredentials({ username: tenant.owner.username, password: 'WrongPass!1' });
      await screens.login.submit();
      await screens.login.expectInvalidCredentials();
    },
  },
  {
    id: 'E2E-AUTH-03',
    title: 'Sign-up screen opens from login',
    tags: ['e2e', 'auth'],
    prepare: async () => {},
    run: async ({ screens }) => {
      await screens.login.expectLoaded();
      await screens.login.openSignUp();
      await screens.register.expectLoaded();
    },
  },
  {
    id: 'E2E-AUTH-04',
    title: 'Forgot-password screen opens from login',
    tags: ['e2e', 'auth'],
    prepare: async () => {},
    run: async ({ screens }) => {
      await screens.login.expectLoaded();
      await screens.login.openForgotPassword();
      await screens.forgotPassword.expectLoaded();
    },
  },
  {
    id: 'E2E-AUTH-06',
    title: 'Owner can sign out',
    tags: ['e2e', 'auth'],
    prepare: loginWithTenant,
    run: async ({ screens, tenant }) => {
      await screens.login.login(tenant.owner);
      await screens.dashboard.expectReady(tenant.property.name);
      await screens.more.open();
      await screens.more.logout();
    },
  },

  // ── Onboarding ────────────────────────────────────────────────────────────
  {
    id: 'E2E-ONB-01',
    title: 'New owner is prompted to set up a hostel',
    tags: ['e2e', 'onboarding'],
    prepare: async (ctx) => {
      ctx.tenant = await provisionTenant({ withProperty: false });
    },
    run: async ({ screens, tenant }) => {
      await screens.login.login(tenant.owner);
      await screens.dashboard.expectSetupPrompt();
    },
  },
  {
    id: 'E2E-ONB-02',
    title: 'Setup wizard opens from the prompt',
    tags: ['e2e', 'onboarding'],
    prepare: async (ctx) => {
      ctx.tenant = await provisionTenant({ withProperty: false });
    },
    run: async ({ screens, tenant }) => {
      await screens.login.login(tenant.owner);
      await screens.dashboard.expectSetupPrompt();
      await screens.dashboard.startSetup();
      const text = await screens.dashboard.text;
      assert(text.length > 20, 'setup wizard rendered an empty screen');
      assert(!text.includes('Page Not Found'), 'setup wizard hit the router error page');
    },
  },
  {
    id: 'E2E-ONB-03',
    title: 'Property and room appear on dashboard and inmates tab',
    tags: ['e2e', 'onboarding'],
    prepare: loginWithTenant,
    run: async ({ screens, tenant }) => {
      await screens.login.login(tenant.owner);
      await screens.dashboard.expectReady(tenant.property.name);
      await screens.inmates.open();
      await screens.inmates.expectLoaded(tenant.property.name);
    },
  },

  // ── Inmates ───────────────────────────────────────────────────────────────
  {
    id: 'E2E-INM-01',
    title: 'Inmates tab lists an existing resident',
    tags: ['e2e', 'inmates'],
    prepare: async (ctx) => {
      ctx.tenant = await provisionTenant();
      ctx.inmate = await ctx.tenant.addInmate();
    },
    run: async ({ screens, tenant, inmate }) => {
      await screens.login.login(tenant.owner);
      await screens.inmates.open();
      await screens.inmates.expectInmate(inmate.name);
    },
  },
  {
    id: 'E2E-INM-02',
    title: 'Owner adds a resident through the form',
    tags: ['e2e', 'inmates'],
    prepare: loginWithTenant,
    run: async ({ driver, screens, tenant }) => {
      await screens.login.login(tenant.owner);
      await screens.inmates.open();
      await screens.inmates.openAddInmate();

      const data = dataFactory.inmate({ bed_no: 2, rent_amount: 7000, due_day: 10 });
      await screens.addInmate.expectLoaded();
      await screens.addInmate.selectRoom(tenant.room.room_no);
      await screens.addInmate.fill({
        name: data.name,
        phone: data.phone,
        email: data.email,
        bedNo: data.bed_no,
        rent: data.rent_amount,
        dueDay: data.due_day,
      });
      await screens.addInmate.save();

      // The form is a pushed route: if the shell (tab bar) is not visible we are
      // still on it, so go back once; if it is, the app already popped for us.
      if (!(await driver.exists('Home'))) {
        await driver.back();
      }
      await screens.inmates.expectInmate(data.name);
    },
  },

  // ── Polls ─────────────────────────────────────────────────────────────────
  {
    id: 'E2E-POLL-01',
    title: 'Polls tab renders an active poll',
    tags: ['e2e', 'polls'],
    prepare: async (ctx) => {
      ctx.tenant = await provisionTenant();
      await ctx.tenant.addPoll({ meal_type: 'dinner' });
    },
    run: async ({ screens, tenant }) => {
      await screens.login.login(tenant.owner);
      await screens.polls.open();
      await screens.polls.expectPoll(/dinner|poll/i);
    },
  },

  // ── Operations ────────────────────────────────────────────────────────────
  {
    id: 'E2E-OPS-01',
    title: 'Complaints screen renders',
    tags: ['e2e', 'ops'],
    prepare: loginWithTenant,
    run: async ({ screens, tenant }) => {
      await screens.login.login(tenant.owner);
      await screens.ops.openComplaints();
    },
  },
  {
    id: 'E2E-OPS-02',
    title: 'Documents screen renders with its upload action',
    tags: ['e2e', 'ops'],
    prepare: loginWithTenant,
    run: async ({ screens, tenant }) => {
      await screens.login.login(tenant.owner);
      await screens.ops.openDocuments();
      await screens.ops.expectButton(/Add hostel document/i);
    },
  },
  {
    id: 'E2E-OPS-03',
    title: 'Expenses screen shows the P&L summary',
    tags: ['e2e', 'ops'],
    prepare: loginWithTenant,
    run: async ({ screens, tenant }) => {
      await screens.login.login(tenant.owner);
      await screens.ops.openExpenses();
      const text = await screens.ops.text;
      assertMatch(text, /Profit & loss/i, 'expenses screen should show the P&L block');
    },
  },
  {
    id: 'E2E-OPS-05',
    title: 'Property settings screen renders',
    tags: ['e2e', 'ops'],
    prepare: loginWithTenant,
    run: async ({ screens, tenant }) => {
      await screens.login.login(tenant.owner);
      await screens.ops.openSettings();
    },
  },
];
