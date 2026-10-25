/**
 * Playwright fixtures — the dependency-injection layer of the framework.
 *
 * Every test gets:
 *   • its own tenant (`owner`, `hostel`) seeded through the API, so tests are
 *     isolated and can run in parallel without cleaning up between each other;
 *   • page objects and flows, already bound to its `page`;
 *   • an optional app instance opened with Flutter semantics enabled (`app`)
 *     or already signed in (`ownerApp` / `hostelApp`).
 *
 * Tests then read as business steps, e.g.
 *   test('...', async ({ hostelApp, hostel, inmateFlow }) => { ... });
 */
import { test as base, expect } from '@playwright/test';
import { env } from '../config/env.js';
import { api } from '../api/hostelhub.api.js';
import { dataFactory } from './data.factory.js';
import { openApp } from '../core/flutter.driver.js';

import { LoginPage } from '../pages/login.page.js';
import { RegisterPage } from '../pages/register.page.js';
import { ForgotPasswordPage } from '../pages/forgot-password.page.js';
import { DashboardPage } from '../pages/dashboard.page.js';
import { InmatesPage } from '../pages/inmates.page.js';
import { AddInmatePage } from '../pages/add-inmate.page.js';
import { PollsPage } from '../pages/polls.page.js';
import { MorePage } from '../pages/more.page.js';
import { OpsPage } from '../pages/ops.page.js';
import { AuthFlow, InmateFlow } from '../flows/journeys.js';

export const test = base.extend({
  // ── Data layer ────────────────────────────────────────────────────────────
  api: async ({}, use) => {
    await use(api);
  },

  /** A fresh owner account (unique per test). */
  owner: async ({ api }, use) => {
    const draft = dataFactory.owner();
    const registered = await api.register(draft); // payload carries the password
    await use({ ...draft, id: registered.user.id, token: registered.token });
  },

  /** Owner + property + one 3-bed room, with helpers to add more data. */
  hostel: async ({ api, owner }, use) => {
    const property = (await api.createProperty(owner.id, dataFactory.property())).property;
    const room = (await api.createRoom(property.id, dataFactory.room({ capacity: 3 }))).room;

    const hostel = {
      owner,
      property,
      room,
      api,
      async addInmate(overrides = {}) {
        const payload = dataFactory.inmate({ room_id: room.id, ...overrides });
        const res = await api.createInmate(property.id, payload);
        return {
          ...payload,
          id: res.inmate.id,
          username: res.inmate.username,
          generatedPassword: res.password,
        };
      },
      async addPoll(overrides = {}) {
        return (await api.createPoll(property.id, dataFactory.poll(overrides))).poll;
      },
      async addNotice(overrides = {}) {
        return (await api.createNotice(property.id, dataFactory.notice(overrides))).notice;
      },
    };

    await use(hostel);
  },

  // ── UI layer ──────────────────────────────────────────────────────────────
  /** App opened and prepared (semantics enabled), signed out. */
  app: async ({ page }, use) => {
    await openApp(page, env.webBaseUrl);
    await use(page);
  },

  /** App opened and signed in as `owner`. */
  ownerApp: async ({ page, owner, loginPage }, use) => {
    await openApp(page, env.webBaseUrl);
    await loginPage.login(owner.username, owner.password);
    await use(page);
  },

  /** App opened, signed in as a hostel owner (property + room exist). */
  hostelApp: async ({ page, hostel, loginPage }, use) => {
    await openApp(page, env.webBaseUrl);
    await loginPage.login(hostel.owner.username, hostel.owner.password);
    await use(page);
  },

  // ── Page objects & flows (bound to the test's page) ───────────────────────
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  forgotPasswordPage: async ({ page }, use) => use(new ForgotPasswordPage(page)),
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
  inmatesPage: async ({ page }, use) => use(new InmatesPage(page)),
  addInmatePage: async ({ page }, use) => use(new AddInmatePage(page)),
  pollsPage: async ({ page }, use) => use(new PollsPage(page)),
  morePage: async ({ page }, use) => use(new MorePage(page)),
  opsPage: async ({ page }, use) => use(new OpsPage(page)),
  authFlow: async ({ page }, use) => use(new AuthFlow(page)),
  inmateFlow: async ({ page }, use) => use(new InmateFlow(page)),
});

export { expect };
