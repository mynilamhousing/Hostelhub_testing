/**
 * Test data factory.
 *
 * Every call returns unique, traceable data: emails land on a dedicated test
 * domain (TEST_EMAIL_DOMAIN) so `scripts/cleanup.sql` can purge exactly what
 * the suites created, and usernames/names carry a run-unique suffix so parallel
 * runs never collide.
 */
import { env } from '../config/env.js';

let sequence = 0;

export function uniqueToken() {
  sequence += 1;
  return `${Date.now().toString(36)}${sequence}${Math.floor(Math.random() * 1000)}`.slice(0, 20);
}

export const dataFactory = {
  owner(overrides = {}) {
    const id = uniqueToken();
    return {
      name: `QA Owner ${id}`,
      username: `qa${id}`.slice(0, 30),
      email: `owner+${id}@${env.testEmailDomain}`,
      phone: `9${String(Date.now()).slice(-9)}`,
      password: env.testPassword,
      role: 'owner',
      ...overrides,
    };
  },

  property(overrides = {}) {
    return {
      name: `QA Hostel ${uniqueToken()}`,
      address: '12 Test Road, Pune',
      type: 'hostel',
      rent_amount: 6500,
      ...overrides,
    };
  },

  room(overrides = {}) {
    return { room_no: `R${Math.floor(100 + Math.random() * 900)}`, capacity: 2, ...overrides };
  },

  inmate(overrides = {}) {
    const id = uniqueToken();
    return {
      name: `QA Inmate ${id}`,
      phone: `8${String(Date.now()).slice(-9)}`,
      email: `inmate+${id}@${env.testEmailDomain}`,
      bed_no: 1,
      rent_amount: 6500,
      due_day: 5,
      join_date: new Date().toISOString().slice(0, 10),
      ...overrides,
    };
  },

  poll(overrides = {}) {
    return {
      meal_type: 'dinner',
      for_date: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
      options: ['Yes', 'No'],
      recurring: true,
      ...overrides,
    };
  },

  notice(overrides = {}) {
    return {
      title: `QA Notice ${uniqueToken()}`,
      body: 'Water supply will be off 2-4pm.',
      ...overrides,
    };
  },
};
